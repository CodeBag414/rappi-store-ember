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

export default Ember.Component.extend(mixinMixpanelSearch,{
  serverUrl: Ember.inject.service('server-url'),
  session: Ember.inject.service('session'),
  showModalReg: false,
  showModalAlert: false,
  showPhoneNumberModel: false,
  showAddressList: false,
  locations: ENV.location,
  url: "",
  hits: [],
  restaurants: [],
  currentType: null,
  hideHeaderContent: false,
  showAddressListToUpdate: false,
  showAddAddressToUpdate: false,
  countryBanner: true,
  addCarrusel: false,
  locationVisible: ENV.locationVisible,
  algoliaFilters: "",
  isWebENV: true,
  slidesToShow: 4,
  showSearchCategoryMenu: false,
  isDataFound: false,
  mouseOverCart: false,
  isSearchStarted: false,
  onHoverBindedOnNav: false,
  isWhimAdded: false,
  showItemsRestaurant: false,
  init() {
    this._super(...arguments);
    let currentUrl = this.serverUrl.getUrl();
    let content = this.storage.get(stContent);
    this.set("url", currentUrl);
    let payPalENV = this.serverUrl.isPayPalENV();
    this.set("isWebENV", !payPalENV);
    this.set("slidesToShow", payPalENV ? 2 : 4);
    if (content !== undefined && content.code.toLowerCase() === "mx") {
      this.set("countryBanner", false);
    }
    if (content !== undefined) {
      if (content.code === "MX") {
        this.set("countryCode", 1);
      }
    }
    if (this.get("isWebENV")) {
      this.addCarruselEvent();
    }

    let storeType = this.get('storeType');
    if (storeType != 'rappicode')
      this.setSearchFilter();

    Ember.$(window).bind('resize', ()=> {
      if (this.get("isWebENV")) {
        this.addCarruselEvent();
      }
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
  addCarruselEvent: function () {
    if (Ember.$('.cl-effect-15') === null || Ember.$('.cl-effect-15').width() === null) {
      var _this = this;
      Ember.run.later(this, ()=> {
        _this.addCarruselEvent();
      }, 100);
      return;
    }
    this.set('addCarrusel', false);
    if ($(window).width() < 792 && !this.get('addCarrusel')) {
      this.set('addCarrusel', true);
      $('.cl-effect-15').slick({
        dots: false,
        mobileFirst: true,
        infinite: true,
        centerMode: false,
        slidesToShow: 5,
        slidesToScroll: 1,
        responsive: [
          {
            breakpoint: 793,
            settings: 'unslick'
          }
        ]
      });
      $(".slick-next").css("display", "none");
      $(".slick-prev").css("display", "none");
    }
  },
  didInsertElement() {
    this._super(...arguments);
    let session = this.get('session');
    if (session.get("isAuthenticated")) {
      let time = this.get('isWebENV') ? 2000 : 10000;
      Ember.run.later(function () {
        Intercom('boot', {
          app_id: ENV.interComAppId,
          name: session.get('currentUser').get('name'),
          email: session.get('currentUser').get('email'),
          created_at: new Date().getTime()
        });
      }, time);
    } else {
      Intercom('boot', {
        app_id: ENV.interComAppId,
      });
    }

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

    if ( Ember.$(window).width() < 480 ) {
      var waypoint = new Waypoint({
        element: document.getElementById('main-content'),
        handler: function(direction) {
          if (direction == "down") {
            Ember.$('.search-bar').addClass('minified');
          } else {
            Ember.$('.search-bar').removeClass('minified');
          }
        },
        offset: 110
      });
    }

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
  willRender() {
    this._super(...arguments);
    let _this = this;
    let currentUrl = this.serverUrl.getUrl();
    let storeType = this.storage.get(stStoreType);
    this.set('supermarketView', storeType === "super");
    this.set('expressView', storeType === "express");
    this.set('pharmacyView', storeType === "farmacia");
    this.set('restaurantsView', storeType === "restaurant");
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
          id: addressId,
          address: completeAddress,
          lat: latitude,
          lng: longitude
        };
        cartObj = this.cart.createCart(storeType, this.storage.get(stShippingCharges), shippingAddress);
      }
      this.set('cartObject', cartObj);
    }

    let cart = this.get('cartObject');
    if (Ember.isPresent(cart)) {
      this.set('isWhimAdded', cart.isWhimAdded());
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
          if (!_this.get('mouseOverCart')) {
            Ember.$('#productMSG').stop(true, true).delay(200).fadeOut(500);
          }

        }, 3000);
      });

      cartObj.on('itemPoped', function () {
        Ember.$('#cartPTAG').text("Producto removido de la ");
        Ember.$('#productMSG').stop(true, true).delay(200).fadeIn(500);
        Ember.run.later(function () {
          if (!_this.get('mouseOverCart')) {
            Ember.$('#productMSG').stop(true, true).delay(200).fadeOut(500);
          }
        }, 3000);
      });

      cartObj.on('whimPushed', function () {
        Ember.$('#productMSG').stop(true, true).delay(200).fadeIn(500);
        Ember.run.later(function () {
          Ember.$('#productMSG').stop(true, true).delay(200).fadeOut(500);
        }, 3000);
      });

      let _this = this;
      cartObj.on('cartRemoved', function () {
        _this.set('cartObject', null);
      });
    }

  },
  setSearchFilter: function () {
    let currentUrl = this.serverUrl.getUrl();
    var latitude = this.storage.get(stLat);
    var longitude = this.storage.get(stLng);
    var store_types = this.get('storeType');
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
  didRender() {
    this._super(...arguments);
    let _this = this;
    Ember.$('.st-menu').removeClass('open');
    let x = Ember.$('.header-index').outerHeight() + Ember.$('.carousel').outerHeight();
    let Y = Ember.$('.main-menuBar').outerHeight() + Ember.$('.carousel').outerHeight();
    let Z = x - Y;
    Ember.$(window).scroll(function () {
      var sticky = Ember.$('body'),
        stickyMain = Ember.$('body main'),
        scroll = Ember.$(window).scrollTop();
      Ember.$('.main-text').css('transform', 'translateY(-' + (scroll / 5) + 'px)');
      Ember.$('#productMSG').stop(true, true).delay(200).fadeOut(1000);
    });

    Ember.$('.basket li.dropdown').hover(function () {
      if (_this.get('cartObject.totalItems') === 1) {
        Ember.$('#cartPTAG').text("Producto en la ");
      } else {
        Ember.$('#cartPTAG').text("Productos en tu ");
      }

      Ember.$('#productMSG').stop(true, true).delay(200).fadeIn(500);
      _this.set('mouseOverCart', true);
    }, function () {

      Ember.$('#productMSG').stop(true, true).delay(200).fadeOut(500);
      _this.set('mouseOverCart', false);
    });
    if (!this.get("onHoverBindedOnNav")) {
      this.set("onHoverBindedOnNav", true);
      Ember.$(".navigation-bar").hover(function () {
        mixpanel.track("hover_dropdown_menu");
      }, function () {
      });
    }
  },
  actions: {
    goToRestaurant: function(restaurantId) {
      this.set("hits", []);
      this.set("restaurants", []);
      this.set('currentlyLoading', true);
      this.storage.set(stStoreType, 'restaurant');
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
    toggleCoupon: function () {
      Ember.$('st-menu').removeClass('open');
      this.toggleProperty('showModalCoupon');
    },
    goToIndex: function() {
      this.get('router').transitionTo('index');
    },
    removeWhim: function () {
      let cart = this.get('cartObject');
      Ember.set(cart.whim, 'buttonText', "+ agregar a la canasta");
      Ember.set(cart.whim, 'isAdded', false);
      this.cart.pushWhim({});
    },
    goToBurgerDay: function () {
      this.get('router').transitionTo('home.burgerday');
    },
    showSearchCategoryMenu: function () {
      this.toggleProperty('showSearchCategoryMenu');
    },
    showDialog: function () {
      this.toggleProperty('showModalReg');
    },
    loginCloseDialog: function () {
      if (this.storage.get(paypal) === undefined) {
        this.toggleProperty('showModalReg');
      }
    },
    closeDialog: function () {
      Ember.$('#comboCountry').val(Ember.$('#comboCountry option:not(:selected)').val());
      this.set('showModalAlert', false);
    },
    inputFocusOut: function () {
    },
    logout() {
      this.get('session').invalidate();
    }, removeProduct: function (product) {
      let id = product.id;
      let storeType = this.storage.get(stStoreType);
      this.cart.removeItemFromCart(storeType, {
        id
      });
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
    search: function (queryField, liValue, liId) {
      this.set("isSearchStarted", false);
      let storeType = this.get('storeType');
      this.searchMixpanelEvent();
      let ids = '';
      if (liValue === undefined) {
        if (Ember.$('.auto-complete').find('li').hasClass("active")) {
          queryField = Ember.$('.auto-complete li.active').text();
          ids = Ember.$('.auto-complete li.active').attr("data");
        } else {
          if (queryField === '' && storeType !== 'restaurant') {
            this.storage.set(stStoreType, storeType);
            this.get('router').transitionTo(this.serverUrl.isPayPalENV() ? 'paypal.store' : 'home.store', storeType);
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
      this.set("restaurants", []);

      let productId = ids;
      let product = queryField;

      if (this.storage.get(stStoreType) === 'rappicode') {
        productId = 0;
        this.storage.set(stStoreType, storeType);
        this.get('router').transitionTo(`home.search`, storeType, productId, queryField);
        return;
      }

      if (ids === '') {
        Ember.run.later(this, function () {
          this.set("isDataFound", true);
        }, 200);
        return;
      }
      this.storage.set(stStoreType, storeType);
      this.get('router').transitionTo(this.serverUrl.isPayPalENV() ? 'paypal.search' : 'home.search', storeType, productId, product);
    },
    changeStoreTypeForSearch: function (storeType) {
      mixpanel.track("search_dropdown_change");
      this.set('queryField', null);
      this.set('storeType', storeType);
      this.set('showSearchCategoryMenu', false);
      Ember.$('#headerProductSearchField').attr("placeholder", "¿Qué estás buscando?");
      if (storeType === "rappicode") {
        Ember.$('#headerProductSearchField').attr("placeholder", "Ingresa tu RappiCode");
      } else {
        this.setSearchFilter();
      }
    },
    changeStoreType: function (storeType) {
      this.set('queryField', null);
      this.sendAction('changeStoreType', storeType);
    },
    showOrder: function () {
      this.sendAction('showOrderStatus');
    }, openBasket: function () {
      //mixpanel events
      this.openCartMixpanelEvent();
      let height = Ember.$(window).height();
      Ember.$(".products-basket").css("max-height", height - 80);
      Ember.$(".products-basket").css("height", height - 80);
      Ember.$('#product-basket').collapse('show');
      Ember.$('#productMSG').stop(true, true).delay(200).fadeOut(500);
      this.sendAction('basketOpenned');
    },
    showOrderPanel: function () {
      mixpanel.track("order_status_bar_clicked");
      let _this = this;
      this.rappiOrder.syncOrder(this.get('session').get('data.authenticated.access_token'), this.serverUrl.getUrl()).then(()=> {
        _this.sendAction('showOrderPanel');
      });
    },
    closeMenu: function() {
      Ember.$('.st-menu').removeClass('open');
    }, openLeftMenu: function () {
      if ( Ember.$(window).width() < 480 ) {
        Ember.$('.st-menu').addClass('open');
      } else {
        var windowHeight = Ember.$(window).height();
        window.scrollTo(0, 0);
        mixpanel.track("open_side_menu");
        this.toggleProperty('showLeftMenu');
        var container = document.getElementById('container');

        if (this.get('showLeftMenu')) {
          Ember.run.later(this, function () {
            Ps.destroy(container);
            Ember.$('#container').css('overflow', 'hidden');
            if (document.getElementById('nav') !== null) {
              Ps.initialize(document.getElementById('nav'), {
                wheelSpeed: 2,
                wheelPropagation: true,
                minScrollbarLength: 20
              });
            }
          }, 100);
        } else {
          Ember.$("#container").css({height: $(window).height()});
          Ember.run.later(this, function () {
            Ember.$('#container').css('overflow', 'auto');
          }, 100);
        }
        Ember.$("#nav-icon1").toggleClass('open');
        Ember.$(".wrapper").toggleClass('nav-triggered');
        Ember.$(".slide-left-menu .main-nav").css('max-height', windowHeight - 318);
        Ember.$(".profile-info").css('height', windowHeight);
      }

    },
    selectLocation: function (value) {
      if (value === "") {
        return;
      }
      let session = this.get('session');
      let location = this.locations[value][this.locations[value].name];
      this.set("location", location);
      this.set("locationIndex", value);
      if (session.get("isAuthenticated")) {
        this.set('showModalAlert', true);
      } else {
        this.send("setContent", this.get("location").lat, this.get("location").lng, (data)=> {
          if (data !== null) {
            this.storage.set(stLng, null);
            this.storage.set(stLat, null);
            this.get('router').transitionTo('index');
            if (session.get("isAuthenticated")) {
              return;
            }
          }
        });
      }
    },
    setContent: function (lat, lng, callback) {
      this.apiService.get(`${ENV.rappiServerURL}/${ENV.resolveCountry}lat=${lat}&lng=${lng}`, null)
        .then((resp)=> {
          resp.countryName = resp.code === 'MX' ? "Mexico" : resp.name;
          this.serverUrl.currentUrl(resp);
          this.serverUrl.setdataByCountry(()=> {
            this.storage.set(stContent, resp);
            callback(resp, null);
          });
        }, (error)=> {
          callback(null, error);
        });
    }, toggleAddressList: function () {
      this.set('showAddressListToUpdate', false);
    }, toggleAddAddress: function () {
      this.set('showAddressListToUpdate', false);
      this.toggleProperty('showAddAddressToUpdate');
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
    if (Ember.isBlank(Ember.$("#headerProductSearchField").val())) {
      return;
    }
    var client = algoliasearch(`${ENV.ALGOLIA_APPLICATION_ID}`, `${ENV.ALGOLIA_API_KEY}`);
    let indexName = `${ENV.INDEX_NAME}`;
    let content = this.storage.get(stContent)
    if (content !== undefined && content.code.toLowerCase() === "mx") {
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
    this.set("isDataFound", false);
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
    if (Ember.isPresent(content) && content.code.toLowerCase() === 'mx') {
      clientIndex = ENV.INDEX_NAME_MX;
    }
    if (Ember.isBlank(Ember.$("#headerProductSearchField").val())) {
      return;
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
        this.set("isDataFound", true);
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
  click: function (e) {
    this.set("isDataFound", false);
    Ember.$('#product-basket').collapse('hide');
    Ember.$("body").css("overflow", "auto");
    if (e.target.toString().indexOf('p') === -1 && e.target.toString().indexOf('selected-category') === -1) {
      this.set("showSearchCategoryMenu", false);
    }
  },
  focusOut: function (e) {

    let time = 300;
    if (e.target.toString().substring(1, 2) === "a") {
      time = 5;
    }
    Ember.run.later(this, function () {
      this.set("hits", []);
      this.set("restaurants", []);
      this.set("isDataFound", false);
    }, time);
  }
});
