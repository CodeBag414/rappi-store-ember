import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stLat,
  stLng,
  stAddress,
  stContent,
  stStoreType,
  stShippingCharges,
  stAddressId,
  stStoreId,
  stSelectedSubcorridorId
  } = ENV.storageKeys;

export default Ember.Component.extend({
  showModalReg: false,
  showModalAlert: false,
  showPhoneNumberModel: false,
  locations: ENV.location,
  countryCode: 0,
  showAddressListToUpdate: false,
  showAddAddressToUpdate: false,
  currentCountry: '',
  countrySelect: 0,
  countryBanner: true,
  selectCountryProcess: false,
  showAddressList: false,
  showModal: false,
  locationVisible: ENV.locationVisible,
  unSelectedCountry: false,
  showSearchCategoryMenu: false,
  currentCateogry: 'Todos',
  currentType: null,
  hits: [],
  restaurants: [],
  algoliaFilters: "",
  onHoverBindedOnNav: false,
  showItemsRestaurant: false,
  init() {
    this._super(...arguments);

    let content = this.storage.get(stContent);
    if (content !== undefined) {
      this.set('currentCountry', content.countryName);
      if (content.code.toLowerCase() === "mx") {
        this.set("countryBanner", false);
      }
    }

    let category = this.storage.get(stStoreType);

    if (category === "super") {
      this.set('currentCateogry', 'Supermercado');
    } else if (category === 'express') {
      this.set('currentCateogry', 'Tienda Express');
    } else if (category === 'restaurant') {
      this.set('currentCateogry', 'Restaurantes');
    } else if (category === 'farmacia') {
      this.set('currentCateogry', 'Farmacia');
    } else if (category === 'rappicode') {
      this.set('currentCateogry', 'RappiCode');
    } else {
      this.set('currentCateogry', 'Todos');
    }

    if (category !== 'rappicode')
      this.setSearchFilter();

    Ember.$(window).bind('resize', function () {
      var widthDiff = Ember.$(window).width() - Ember.$(".ember-modal-dialog").width();
      var widthDiv = widthDiff / 2;
      var heightDiff = Ember.$(window).height() - Ember.$(".ember-modal-dialog").height();
      var heightDiv = heightDiff / 2;
      Ember.$(".ember-modal-dialog").css({
        left: widthDiv + 'px',
        top: heightDiv + 'px',
        'margin-left': '0',
        'margin-top': '0'
      });
    });

  },
  stores: function () {
    return {
      expressStore: "express",
      restaurantStore: "restaurant",
      farmatodoStore: "farmacia",
      marketStore: this.get('marketStore'),
      superStore: "super"
    };
  }.property('marketStore'),
  setSearchFilter: function () {
    let currentUrl = this.serverUrl.getUrl();
    var latitude = this.storage.get(stLat);
    var longitude = this.storage.get(stLng);
    var store_types = this.storage.get(stStoreType);
    if (store_types === "farmacia") {
      store_types = "Farmatodo";
    }
    if (this.get("currentType") === null || store_types !== this.get("currentType")) {

      this.set("hits", []);
      this.set("restaurants", []);
      this.set("currentType", store_types);
      var stores = [];
      let url = `${currentUrl}${ENV.storage}lat=${latitude}&lng=${longitude}&store_types=${store_types}`;
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
        this.set("algoliaFilters", "");
      });
    }
  },
  willRender() {
    this._super(...arguments);
    let currentUrl = this.serverUrl.getUrl();
    let storeType = this.storage.get(stStoreType);
    let cartObj = this.get('cartObject');
    if (Ember.isEmpty(cartObj) && Ember.isEmpty(storeType)) {
      cartObj = this.cart.getCart('whim');
      if (Ember.isEmpty(cartObj)) {
        cartObj = this.cart.createCart('whim');
        this.set('cartObject', cartObj);
      }
    } else if (Ember.isEmpty(cartObj) || (Ember.isPresent(storeType) && cartObj.get('name') !== storeType)) {
      cartObj = this.cart.getCart(storeType);
      if (Ember.isEmpty(cartObj)) {
        let completeAddress = this.storage.get(stAddress);
        let latitude = this.storage.get(stLat);
        let longitude = this.storage.get(stLng);
        let addressId = this.storage.get(stAddressId);
        let shippingAddress = {
          id: addressId || 0,
          address: completeAddress,
          lat: latitude,
          lng: longitude
        };
        cartObj = this.cart.createCart(storeType, this.storage.get(stShippingCharges), shippingAddress);
      }
      this.set('cartObject', cartObj);
    }

    if (this._state !== 'destroying' && Ember.isPresent(cartObj)) {
      cartObj.on('itemPushed', function () {
        Ember.$('#productMSG').stop(true, true).delay(200).fadeIn(500);
        if (cartObj.get('totalItems') === 1) {
          Ember.$('#cartPTAG').text("Producto en la ");
        } else {
          Ember.$('#cartPTAG').text("Productos en tu ");
        }
        Ember.run.later(function () {
          Ember.$('#productMSG').stop(true, true).delay(200).fadeOut(500);
        }, 3000);
      });

      cartObj.on('itemPoped', function () {
        Ember.$('#cartPTAG').text("Producto removido de la ");
        Ember.$('#productMSG').stop(true, true).delay(200).fadeIn(500);
        Ember.run.later(function () {
          Ember.$('#productMSG').stop(true, true).delay(200).fadeOut(500);
        }, 3000);
      });

      cartObj.on('whimPushed', function () {
        Ember.$('#whimMSG').stop(true, true).delay(200).fadeIn(500);
        Ember.run.later(function () {
          Ember.$('#whimMSG').stop(true, true).delay(200).fadeOut(500);
        }, 3000);
      });

      let _this = this;
      cartObj.on('cartRemoved', function () {
        _this.set('cartObject', null);
      });
    }

    var latitude = this.storage.get(stLat);
    var longitude = this.storage.get(stLng);
    var store_types = this.storage.get(stStoreType);
    if (store_types === "farmacia") {
      store_types = "Farmatodo";
    }
    if (this.get("currentType") === null || store_types !== this.get("currentType")) {
      this.set("hits", []);
      this.set("currentType", store_types);
      var stores = [];
      let url = `${currentUrl}${ENV.storage}lat=${latitude}&lng=${longitude}&store_types=${store_types}`;
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
    }
  },
  didRender() {
    this._super(...arguments);
    let _this = this;
    Ember.$(window).scroll(function () {
      var scroll = Ember.$(window).scrollTop();
      if (Ember.$(window).width() < 481) {
        return;
      }
      if (scroll > 264) {
        Ember.$('.menu-container').addClass('fixed');
        Ember.$('.explore-sections').addClass('fixed');
      } else {
        Ember.$('.menu-container').removeClass('fixed');
        Ember.$('.explore-sections').removeClass('fixed');
      }
      if (scroll > 10) {
        Ember.$('.header-bar').css('visibility', 'visible');
      } else {
        Ember.$('.header-bar').css('visibility', 'hidden');
      }

      Ember.$('.header-bar').css('opacity', Math.pow(scroll / 264, 7));
      Ember.$('#productMSG').stop(true, true).delay(200).fadeOut(1000);

    });

    Ember.$('.basket li.dropdown').hover(function () {
      if (_this.get('cartObject.totalItems') === 1) {
        Ember.$('#cartPTAG').text("Producto en la ");
      } else {
        Ember.$('#cartPTAG').text("Productos en tu ");
      }

      Ember.$('#productMSG').stop(true, true).delay(200).fadeIn(500);
    }, function () {
      Ember.$('#productMSG').stop(true, true).delay(200).fadeOut(500);
    });
    if (!this.get("onHoverBindedOnNav")) {
      this.set("onHoverBindedOnNav", true);
      Ember.$(".navigation-bar").hover(function () {
        mixpanel.track("hover_dropdown_menu");
      }, function () {
      });
    }
  },
  didInsertElement: function () {
    var $menu = $(".category-menu");
    $menu.menuAim({
      activate: this.activateSubmenu,
      deactivate: this.deactivateSubmenu
    });
    var setTimeoutConst;
    Ember.$(".navigation-item").hover(function () {
      var navItem = $(this);
      setTimeoutConst = setTimeout(function () {
        navItem.addClass("active");
      }, 300);
    }, function () {
      clearTimeout(setTimeoutConst);
      Ember.$(".navigation-item").removeClass("active");
      Ember.$(".main-subcategory-menu").css("display", "none");
    });
  },
  activateSubmenu: function (row) {
    var $row = $(row),
      submenuId = $row.data("submenuId"),
      $submenu = $("#" + submenuId);

    $submenu.css({
      display: "block"
    });

  },
  deactivateSubmenu: function (row) {
    var $row = $(row),
      submenuId = $row.data("submenuId"),
      $submenu = $("#" + submenuId);
    $submenu.css("display", "none");
  },
  actions: {
    goToRestaurant: function(restaurantId) {
      this.set("hits", []);
      this.set("restaurants", []);
      this.set('currentlyLoading', true);
      this.storage.set(stStoreId, restaurantId);
      this.get('router').transitionTo('home.subcorridor', restaurantId);
    },
    selectMeaning: function (place_or_product, keyword) {
      this.set("hits", []);
      this.set("restaurants", []);
      this.set('currentlyLoading', true);
      this.get('router').transitionTo("home.place-and-product", keyword).then(function (newRoute) {
        if (place_or_product == 'place') {
          newRoute.controller.set('isPlace', true);
        } else {
          newRoute.controller.set('isPlace', false);
        }
      });
    },
    showDialog: function () {
      this.toggleProperty('showModalReg');
    },
    closeDialog: function () {
      Ember.$('#comboCountry').val(Ember.$('#comboCountry option:not(:selected)').val());
      this.set('showModalAlert', false);
    },
    showDialogPhone: function () {
      this.toggleProperty('showPhoneNumberModel');
    },
    showDialogPhooneVerify: function () {
      this.toggleProperty('showPhoneNumberVerifyModel');
    },
    showSearchCategoryMenu: function () {
      this.toggleProperty('showSearchCategoryMenu');
    },
    logout(){
      this.get('session').invalidate();
    },
    toggleAddressList: function () {
      this.set('showAddressListToUpdate', false);
    }, toggleAddAddress: function () {
      this.set('showAddressList', false);
      this.set('showAddressListToUpdate', false);
      this.toggleProperty('showAddAddressToUpdate');
    },
    changeStoreType: function (storeType) {
      this.sendAction("changeStoreType", storeType);
    },
    countryOption: function () {
      this.set('unSelectedCountry', true);
    },
    selectSearchCategory: function (category) {
      this.toggleProperty('showSearchCategoryMenu');
      if (category === "todos") {
        this.storage.set(stStoreType, null);
      } else if (category !== "whim") {
        this.storage.set(stStoreType, category);
      }
      Ember.$('#headerProductSearchField').attr("placeholder", "¿Qué estás buscando?");
      if (category === "super") {
        this.set('currentCateogry', 'Supermercado');
      } else if (category === 'express') {
        this.set('currentCateogry', 'Tienda Express');
      } else if (category === 'restaurant') {
        this.set('currentCateogry', 'Restaurantes');
      } else if (category === 'farmacia') {
        this.set('currentCateogry', 'Farmacia');
      } else if (category === 'whim') {
        this.set('currentCateogry', 'Antojos');
      } else if (category === 'rappicode') {
        this.set('currentCateogry', 'RappiCode');
        Ember.$('#headerProductSearchField').attr("placeholder", "Ingresa tu RappiCode");
      } else {
        this.set('currentCateogry', 'Todos');
      }
      if (category !== 'rappicode') {
        this.setSearchFilter();
      }


    },
    search: function (queryField, liValue, liId) {

      let storeType = this.storage.get(stStoreType);
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
    },
    redirectToHome: function (storeType) {
      if (this.get('session').get('isAuthenticated')) {
        let address = this.storage.get(stAddress);
        let lat = this.storage.get(stLat);
        let lng = this.storage.get(stLng);
        let id = this.storage.get(stAddressId);
        let shippingAddress = {
          id: id || 0,
          address: address,
          lat: lat,
          lng: lng
        };
        this.cart.createCart(storeType, this.storage.get(stShippingCharges), shippingAddress);
      }
      this.sendAction("changeStoreType", storeType);
    },
    goToCategory: function (storeType, categoryId, subCategoryId, storeId) {
      if (storeType === "super") {
        mixpanel.track("enter_super_category");
      }
      Ember.$(".navigation-item").removeClass("active");
      Ember.$(".main-subcategory-menu").css("display", "none");
      this.storage.set(stStoreType, storeType);
      this.storage.set(stStoreId, storeId);
      this.storage.set(stSelectedSubcorridorId, subCategoryId);
      this.get('router').transitionTo(`home.corridor`, categoryId);
    },
    goToSubcategory: function (storeType, subcategoryId, storeId) {
      Ember.$(".navigation-item").removeClass("active");
      Ember.$(".main-subcategory-menu").css("display", "none");
      this.storage.set(stStoreType, storeType);
      this.storage.set(stStoreId, storeId);
      this.get('router').transitionTo(`home.subcorridor`, subcategoryId);
    },
    removeProduct: function (product) {
      let id = product.id;
      let storeType = this.storage.get(stStoreType);
      this.cart.removeItemFromCart(storeType, {
        id
      });
    },
    openBasket: function () {
      //mixpanel events
      let storeType = this.storage.get(stStoreType);
      mixpanel.track("open_cart");
      if (window.location.pathname.includes("whims-and-desires") || window.location.hash.includes("whims-and-desires")) {
        mixpanel.track("open_cart_antojos");
      } else if (storeType === "express") {
        mixpanel.track("open_cart_express");
      } else if (storeType === "restaurant") {
        mixpanel.track("open_cart_restaurant");
      } else if (storeType === "farmacia") {
        mixpanel.track("open_cart_farmica");
      } else if (storeType === "super") {
        mixpanel.track("open_cart_super");
      }
      Ember.$('#product-basket').collapse('show');
      Ember.$('#productMSG').stop(true, true).delay(200).fadeOut(500);
      this.sendAction('basketOpenned');
    }
  },
  keyPress: function (e) {
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
    let content = this.storage.get(stContent);
    if (content !== undefined && content.code.toLowerCase()=== "mx") {
      indexName = `${ENV.INDEX_NAME_MX}`;
    }
    var index = client.initIndex(indexName);
    this.set("hits", []);
    this.set("restaurants", []);
    let currentType = this.get('currentType');

    Ember.run.later(this, function () {
      index.search(Ember.$("#headerProductSearchField").val(), {
        attributesToRetrieve: ['id', 'name', 'description'],
        hitsPerPage: 30,
        filters: this.get("algoliaFilters")
      }, (err, content)=> {
        if (err) {
          return;
        }
        if (currentType === "restaurant") {
          this.apiService.get(`${ENV.rappiServerURL}api/web/search/restaurants?text=${Ember.$("#headerProductSearchField").val()}`, null)
            .then((data)=> {

                this.set("restaurants", data);
                this.set("hits", content.hits);
            }).catch((error)=> {
                this.set("restaurants", []);
                this.set("hits", content.hits);
            });
        } else {
          this.set("hits", content.hits);
        }
      });
    }, 300);
  },
  keyUp: function (e) {
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
    if (Ember.isPresent(content) && content.code.toLowerCase()=== "mx") {
      clientIndex = ENV.INDEX_NAME_MX;
    }

    var client = algoliasearch(`${ENV.ALGOLIA_APPLICATION_ID}`, `${ENV.ALGOLIA_API_KEY}`);
    var index = client.initIndex(`${clientIndex}`);
    this.set("hits", []);
    this.set("restaurants", []);
    let currentType = this.get('currentType');

    Ember.run.later(this, function () {
      index.search(Ember.$("#headerProductSearchField").val(), {
        attributesToRetrieve: ['id', 'name', 'description'],
        hitsPerPage: 30,
        filters: this.get("algoliaFilters")
      }, (err, content)=> {
        if (err) {
          return;
        }
        if (currentType === "restaurant") {
          this.apiService.get(`${ENV.rappiServerURL}api/web/search/restaurants?text=${Ember.$("#headerProductSearchField").val()}`, null)
            .then((data)=> {
                this.set("restaurants", data);
                this.set("hits", content.hits);
            }).catch((error)=> {
                this.set("restaurants", []);
                this.set("hits", content.hits);
            });
        } else {
          this.set("hits", content.hits);
        }
      });
    }, 300);
  },
  focusOut: function (e) {
    let time = 300;
    if (e.target.toString().substring(1, 2) === "a") {
      time = 5;
    }
    Ember.run.later(this, function () {
      this.set("hits", []);
      this.set("restaurants", []);
    }, time);

    Ember.run.later(this, function () {
      this.set('unSelectedCountry', false);
    }, 300);
  },
  click: function (e) {

    if (e.target.toString().indexOf('p') === -1 && e.target.toString().indexOf('selected-category') === -1) {
      this.set("showSearchCategoryMenu", false);
    }
  }
});
