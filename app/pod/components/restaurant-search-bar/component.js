import Ember from 'ember';
import ENV from 'rappi/config/environment';
import mixinMixpanelSearch from "../../../mixins/mix-panel-search-common-event";

const {
  stLat,
  stLng,
  stAddress,
  stContent,
  stStoreType,
  paypal,
  stShippingCharges,
  stAddressId,
  stStoreId,
  stSelectedSubcorridorId
  } = ENV.storageKeys;

export default Ember.Component.extend(mixinMixpanelSearch, {
  serverUrl: Ember.inject.service('server-url'),
  hits: [],
  restaurants: [],
  algoliaFilters: "",
  searching: false,
  init() {
    this._super(...arguments);
    let currentUrl = this.serverUrl.getUrl();

    var latitude = this.storage.get(stLat);
    var longitude = this.storage.get(stLng);
    this.set("hits", []);

    let url = `${currentUrl}${ENV.storage}lat=${latitude}&lng=${longitude}&store_types=restaurant`;
    Ember.$.ajax({
      type: "GET",
      url: url,
    }).then((rsp)=> {
      let filterString = "";
      for (var key in rsp.stores) {
        if (rsp.stores[key].store_id > 0) {
          filterString += rsp.stores[key].store_id.toString() + " OR ";
        }
      }
      filterString = filterString.substr(0, filterString.lastIndexOf(" OR "));
      this.set("algoliaFilters", filterString);
    }).fail((err)=> {
      console.info("err>> is ...", err);
    });

  },
  actions: {
    searchKeyword: function() {
      this.set("searching", true);
      var client = algoliasearch(`${ENV.ALGOLIA_APPLICATION_ID}`, `${ENV.ALGOLIA_API_KEY}`);
      let indexName = `${ENV.INDEX_NAME}`;
      let content = this.storage.get(stContent)
      if (content !== undefined && content.countryName === "Mexico") {
        indexName = `${ENV.INDEX_NAME_MX}`;
      }
      var index = client.initIndex(indexName);
      this.set("hits", []);
      this.set("restaurants", []);

      Ember.run.later(this, function () {
        index.search(Ember.$("#restaurantSearchField").val(), {
          attributesToRetrieve: ['id', 'name', 'description'],
          hitsPerPage: 30,
          filters: this.get("algoliaFilters")
        }, (err, content)=> {
          if (err) {
            return;
          }
          this.apiService.get(`${ENV.rappiServerURL}api/web/search/restaurants?text=${Ember.$("#restaurantSearchField").val()}`, null)
            .then((data)=> {
                this.set("restaurants", data);
                this.set("hits", content.hits);
                this.set("searching", false);
            }).catch((error)=> {
                this.set("restaurants", []);
                this.set("hits", content.hits);
                this.set("searching", false);
            });
        });
      }, 300);
    },
    goToRestaurant: function(restaurantId) {
      this.storage.set(stStoreId, restaurantId);
      this.get('router').transitionTo('home.subcorridor', restaurantId);
    },
    selectMeaning: function (place_or_product, keyword) {
      this.set("hits", []);
      this.set("restaurants", []);
      this.get('router').transitionTo("home.place-and-product", keyword).then(function (newRoute) {
        if (place_or_product == 'place') {
          newRoute.controller.set('isPlace', true);
        } else {
          newRoute.controller.set('isPlace', false);
        }
      });
    },
    search: function (queryField, liValue, liId) {
      this.set('searching', true);
      this.set("isSearchStarted", false);
      let storeType = this.storage.get(stStoreType);
      this.searchMixpanelEvent();
      let ids = '';
      if (liValue === undefined) {
        if (Ember.$('.auto-complete').find('li').hasClass("active")) {
          queryField = Ember.$('.auto-complete li.active').text();
          ids = Ember.$('.auto-complete li.active').attr("data");
        } else {
          if (queryField === '' && this.storage.get(stStoreType) !== 'restaurant') {
            this.get('router').transitionTo('home.store', storeType);
            this.set("hits", []);
            this.set("restaurants", []);
            return;
          }
          let hits = this.get("hits");
          let arr = [];
          for (var key in hits) {
            if (hits.hasOwnProperty(key)) {
              arr.push(hits[key].id);
            }
          }
          ids = arr.toString();
        }
      } else {
        queryField = liValue;
        ids = liId;
      }
      this.set("queryField", queryField);
      this.set("hits", []);

      let productId = ids;
      let product = queryField;
      if (this.storage.get(stStoreType) === 'rappicode') {
        productId = 0;
        this.get('router').transitionTo(`home.search`, storeType, productId, queryField);
        return;
      }
      if (ids === '') {
        return;
      }
      this.get('router').transitionTo(`home.search`, storeType, productId, product);
    }
  },
  keyPress: function (e) {
    if (e.target.id === "what" || e.target.id === "whim") {
      return;
    }

    if (e.keyCode === 16) {
      let value = Ember.$('.auto-complete li.active a').text();
      let key = Ember.$('.auto-complete li.active').attr('data');
      if (!Ember.$('.auto-complete').find('li').hasClass("active")) {
        this.send("search", this.get("queryField"));
        return;
      }
      this.send("search", '', value, key);
      this.set("hits", []);
      return;
    }

    if (e.keyCode === 27) {
      this.set("queryField", "");
      this.set("hits", []);
      this.set("restaurants", []);
      return;
    }
    if (e.keyCode === 9 && e.keyCode === 38 && e.keyCode === 40) {
      return;
    }

    if (e.keyCode === 13 ) {
      this.set("searching", true);
      var client = algoliasearch(`${ENV.ALGOLIA_APPLICATION_ID}`, `${ENV.ALGOLIA_API_KEY}`);
      let indexName = `${ENV.INDEX_NAME}`;
      let content = this.storage.get(stContent)
      if (content !== undefined && content.countryName === "Mexico") {
        indexName = `${ENV.INDEX_NAME_MX}`;
      }
      var index = client.initIndex(indexName);
      this.set("hits", []);
      this.set("restaurants", []);

      Ember.run.later(this, function () {
        index.search(Ember.$("#restaurantSearchField").val(), {
          attributesToRetrieve: ['id', 'name', 'description'],
          hitsPerPage: 30,
          filters: this.get("algoliaFilters")
        }, (err, content)=> {
          if (err) {
            return;
          }
          this.apiService.get(`${ENV.rappiServerURL}api/web/search/restaurants?text=${Ember.$("#restaurantSearchField").val()}`, null)
            .then((data)=> {
                this.set("restaurants", data);
                this.set("hits", content.hits);
                this.set("searching", false);
            }).catch((error)=> {
                this.set("restaurants", []);
                this.set("hits", content.hits);
                this.set("searching", false);
            });
        });
      }, 300);
    }

  },
  keyUp: function (e) {
    if (e.target.id === "what" || e.target.id === "whim") {
      return;
    }
    var $this;

    if (!Ember.$('.auto-complete').find('li').hasClass("active") && e.keyCode === 40) {
      $this = Ember.$('.auto-complete').find('li').first().focus();
    } else if (e.keyCode !== 38) {
      $this = Ember.$('.auto-complete').find('.active').next().focus();
    }

    if (e.keyCode === 40) {
      $this.addClass('active').siblings().removeClass();
      $this.closest('ul.auto-complete').scrollTop($this.index() * $this.outerHeight());
      this.set("queryField", Ember.$('.auto-complete li.active a').text());
      return false;
    } else if (e.keyCode === 38) {
      $this = Ember.$('.auto-complete').find('.active').prev().focus();
      $this.addClass('active').siblings().removeClass();
      $this.closest('ul.auto-complete').scrollTop($this.index() * $this.outerHeight());
      this.set("queryField", Ember.$('.auto-complete li.active a').text());
      return false;
    }

    if (e.keyCode === 27) {
      this.set("queryField", "");
      this.set("hits", []);
      this.set("restaurants", []);
      return;
    }

    if (e.keyCode === 13) {
      let content = this.storage.get(stContent);
      let clientIndex = ENV.INDEX_NAME;
      if (Ember.isPresent(content) && content.countryName === "Mexico") {
        clientIndex = ENV.INDEX_NAME_MX;
      }

      var client = algoliasearch(`${ENV.ALGOLIA_APPLICATION_ID}`, `${ENV.ALGOLIA_API_KEY}`);
      var index = client.initIndex(`${clientIndex}`);
      this.set("hits", []);
      this.set("restaurants", []);

      Ember.run.later(this, function () {
        index.search(Ember.$("#restaurantSearchField").val(), {
          attributesToRetrieve: ['id', 'name', 'description'],
          hitsPerPage: 30,
          filters: this.get("algoliaFilters")
        }, (err, content)=> {
          if (err) {
            return;
          }
          this.apiService.get(`${ENV.rappiServerURL}api/web/search/restaurants?text=${Ember.$("#restaurantSearchField").val()}`, null)
            .then((data)=> {

                this.set("restaurants", data);
                this.set("hits", content.hits);
                this.set("searching", false);
            }).catch((error)=> {
                this.set("restaurants", []);
                this.set("hits", content.hits);
                this.set("searching", false);
            });
        });
      }, 300);
    }

  },
  focusOut: function (e) {
    let time = 300;

    Ember.run.later(this, function () {
      this.set("hits", []);
      this.set("restaurants", []);
    }, time);

  }
});
