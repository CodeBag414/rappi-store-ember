import Ember from 'ember';
import ENV from 'rappi/config/environment';

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

export default Ember.Component.extend({
  serverUrl: Ember.inject.service('server-url'),
  hits: [],
  algoliaFilters: "",
  init() {
    this._super(...arguments);
    let currentUrl = this.serverUrl.getUrl();

    var latitude = this.storage.get(stLat);
    var longitude = this.storage.get(stLng);
    this.set("hits", []);

    let url = `${currentUrl}${ENV.storage}lat=${latitude}&lng=${longitude}&store_types=hiper`;
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
      console.log(this.get("algoliaFilters"));
    }).fail((err)=> {
      console.info("err>> is ...", err);
    });

  },
  actions: {
    addProduct: function(id, name) {
      this.set('queryField', '');
      this.set('hits', []);
      this.sendAction('addProduct', id, name);
    }
  },
  keyPress: function (e) {
    if (e.target.id === "what" || e.target.id === "whim") {
      return;
    }

    if (e.keyCode === 13) {
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
      this.set("hits", []);
      return;
    }
    if (e.keyCode === 9 && e.keyCode === 38 && e.keyCode === 40) {
      return;
    }
    var client = algoliasearch(`${ENV.ALGOLIA_APPLICATION_ID}`, `${ENV.ALGOLIA_API_KEY}`);
    let indexName = `${ENV.INDEX_NAME}`;
    let content = this.storage.get(stContent)
    if (content !== undefined && content.countryName === "Mexico") {
      indexName = `${ENV.INDEX_NAME_MX}`;
    }
    var index = client.initIndex(indexName);
    this.set("hits", []);

    Ember.run.later(this, function () {
      index.search(Ember.$("#listProductSearchField").val(), {
        attributesToRetrieve: ['id', 'name', 'description'],
        hitsPerPage: 30,
        filters: this.get("algoliaFilters")
      }, (err, content)=> {
        if (err) {
          return;
        }
        this.set("hits", content.hits);
      });
    }, 300);
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

    let content = this.storage.get(stContent);
    let clientIndex = ENV.INDEX_NAME;
    if (Ember.isPresent(content) && content.countryName === "Mexico") {
      clientIndex = ENV.INDEX_NAME_MX;
    }

    var client = algoliasearch(`${ENV.ALGOLIA_APPLICATION_ID}`, `${ENV.ALGOLIA_API_KEY}`);
    var index = client.initIndex(`${clientIndex}`);
    this.set("hits", []);
    Ember.run.later(this, function () {
      index.search(Ember.$("#listProductSearchField").val(), {
        attributesToRetrieve: ['id', 'name', 'description'],
        hitsPerPage: 30,
        filters: this.get("algoliaFilters")
      }, (err, content)=> {
        if (err) {
          return;
        }
        this.set("hits", content.hits);
      });
    }, 300);
  },
  focusOut: function (e) {
    let time = 300;

    Ember.run.later(this, function () {
      this.set("hits", []);
    }, time);

  }
});
