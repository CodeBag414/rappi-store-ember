import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stLat,
  stLng,
  stAddress,
  stContent,
  stStoreType,
  stShippingCharges,
  stAddressId
  } = ENV.storageKeys;

export default Ember.Component.extend({
  serverUrl: Ember.inject.service('server-url'),
  url: "",
  showAddressList: false,//for opening add address popup when change directions is clicked
  showEmptyBasketModal: false,//for opening empty basket popup
  showAddAddress: false,
  shoppingBasket: {},
  showLoginPopUp: false,
  sessionFound: false,
  activeLat: null,
  activeLng: null,
  activeAddress: null,
  overflow: false,
  orderExist: false,
  session: Ember.inject.service('session'),
  cartEmpty: true,
  phoneVerification: false,
  showExistingOrder: false,
  isWhimFound: false,
  addressCorrect: true,
  whimObj: null,
  showAddressListWhenCheckout: false,
  minValuePurchasePercentage: 0,
  market: null,
  now: null,
  promoModalUrl: 'assets/images/promo-modal.jpg',
  init() {
    this._super(...arguments);
    let currentUrl = this.serverUrl.getUrl();
    this.set("url", currentUrl);
    this._getChargesZone("market", this.storage.get(stLat), this.storage.get(stLng));
    this._getChargesZone("now", this.storage.get(stLat), this.storage.get(stLng));
    var _this = this;
    this.serverUrl.setdataByCountry(function () {
      _this.set("minValuePurchasePercentage", parseInt(_this.serverUrl.getDataByCountry().min_value_purchase_percentage));
      _this.willRender();
    });
    Ember.$('body').on('click', '.basket-overlay', function (event) {
      if (Ember.$(event.target).find('#product-basket-a').attr('aria-expanded')) {
        _this.send('hideBasket');
      }
    })
  },
  _getChargesZone: function (shippingType, lat, long) {
    var _this = this;
    let currentUrl = this.serverUrl.getUrl()
    Ember.$.ajax({
      type: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      dataType: 'json',
      url: `${currentUrl}/${ENV.chargesZone}` + shippingType + '?lat=' + lat + '&lng=' + long,
    }).then((charges)=> {
      charges.forEach(function (charge) {
        _this.set(shippingType, charges);
      });
    });
  },
  disableCheckout: function () {
    if (this.get('isWhimFound')) {
      return false;
    } else if (this.get('cartEmpty')) {
      return true;
    }
  }.property('cartEmpty', 'isWhimFound'),
  didReceiveAttrs() {
    this._super(...arguments);
    Ember.$('#product-basket').collapse('hide');
  },
  willRender() {
    this._super(...arguments);
    let storeType = this.storage.get(stStoreType);
    let completeAddress = this.storage.get(stAddress);
    let latitude = this.storage.get(stLat);
    let longitude = this.storage.get(stLng);
    let addressId = this.storage.get(stAddressId) || 0;
    let cart = this.cart.getCart(storeType);
    if (this._state !== 'destroying' && Ember.isPresent(cart)) {
      cart.updateShippingAddress({id: addressId, address: completeAddress, lng: longitude, lat: latitude});
      this.set('shoppingBasket', cart);
      let _this = this;
      cart.on('cartRemoved', function () {
        _this.set('cartEmpty', true);
        _this.set('shoppingBasket', {});
      });
    } else if (Ember.isPresent(completeAddress) && Ember.isPresent(latitude) && Ember.isPresent(longitude)) {
      let shippingAddress = {
        id: addressId || 0,
        address: completeAddress,
        lat: latitude,
        lng: longitude
      };
      let cartCreated = this.cart.createCart(storeType, this.storage.get(stShippingCharges), shippingAddress);
      this.set('shoppingBasket', cartCreated);
    }
    let basket = this.get('shoppingBasket');
    if (Ember.isPresent(basket)) {
      this.set('isWhimFound', basket.isWhimAdded());
      if (this.get('session').get('isAuthenticated') && basket.get('order').get('address').get('id') === 0) {
        let userAddress = this.get('session').get('currentAddress');
        userAddress.forEach((addressObj)=> {
          if (addressObj.get('active')) {
            let id = addressObj.get('id');
            let address = addressObj.get('address');
            let description = addressObj.get('description');
            let lng = addressObj.get('lng');
            let lat = addressObj.get('lat');
            let tag = addressObj.get('tag');
            let active = addressObj.get('active');
            let lastorder = addressObj.get('lastorder');
            basket.updateShippingAddress({id, address, description, lng, lat, tag, active, lastorder});
            return;
          }
        });
      }
    }

    if (Ember.isPresent(this.cart.getCart(storeType)) && Ember.isPresent(this.cart.getCart(storeType).get('cartItems')) && this.cart.getCart(storeType).get('cartItems').get('length') > 0) {
      this.set('cartEmpty', false);
    } else {
      this.set('cartEmpty', true);
    }
    let shippingType = basket.get('cartType') === ENV.defaultStoreType ? 'market' : 'now';
    let totalPrice = parseFloat(basket.get('totalPrice'));
    var shippingCharges = 0;
    let _minValuePurchasePercentage = this.get("minValuePurchasePercentage");
    let chargesZone = this.get(shippingType);
    if (Ember.isPresent(chargesZone)) {
      chargesZone.forEach(function (charge) {
        switch (charge.charge_type) {
          case "purchase_percentage":
            let purchasePercentage = totalPrice * charge.value;
            if (purchasePercentage <= _minValuePurchasePercentage) {
              shippingCharges += _minValuePurchasePercentage;
            }
            else if (purchasePercentage > _minValuePurchasePercentage) {
              shippingCharges += purchasePercentage;
            }
            break;
          case "shipping":
            shippingCharges += charge.value;
            break;
          case "products_value":
            let calculationCriteria = charge.calculation_criteria.repetitions;
            shippingCharges += Math.floor(totalPrice / calculationCriteria) * charge.value;
            break;
        }
      });
      basket.set('shippingCharges', parseInt(shippingCharges));
    }
  },
  actions: {
    collapseEvent: function () {
      if (!this.get("overflow")) {
        this.set("overflow", true);
      }
      if (!this.get("basketOpenned")) {
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
      }
      this.toggleProperty('basketOpenned');
      let height = Ember.$(window).height();
      Ember.$(".products-basket").css("max-height", height - 80);
      Ember.$(".products-basket").css("height", height - 80);
    },
    addToCart: function (product) {
      let storeType = this.storage.get(stStoreType);
      //mixpanel events
      if (storeType === "express") {
        mixpanel.track("add_to_cart_express");
      } else if (storeType === "restaurant") {
        mixpanel.track("add_to_cart_restaurant");
      } else if (storeType === "farmacia") {
        mixpanel.track("add_to_cart_farmica");
      } else if (storeType === "super") {
        mixpanel.track("add_to_cart_super");
      }
      let id = product.id;
      this.cart.pushCart(storeType, {
        id
      });
    }, removeFromCart: function (product) {
      let id = product.id;
      let storeType = this.storage.get(stStoreType);
      this.cart.popCart(storeType, {
        id
      });
    }, removeProduct: function (product) {
      let id = product.id;
      let storeType = this.storage.get(stStoreType);
      this.cart.removeItemFromCart(storeType, {
        id
      });
    }, removeWhim: function () {
      let basket = this.get('shoppingBasket');
      Ember.set(basket.whim, 'buttonText', "+ agregar a la canasta");
      Ember.set(basket.whim, 'isAdded', false);
      this.cart.pushWhim({});
    }, hideBasket: function () {
      if (this._state !== 'destroying') {
        this.toggleProperty('basketOpenned');
      }
      Ember.$('#product-basket').collapse('hide');
    }, placeOrder: function () {
      mixpanel.track("hacer_pedido");
      let session = this.get('session');
      if (!this.get("overflow")) {
        this.set("overflow", true);
        Ember.$("body").css("overflow", "hidden");
      } else {
        this.set("overflow", false);
        Ember.$("body").css("overflow", "auto");
      }
      this.toggleProperty('basketOpenned');
      let isAuthenticated = session.get('isAuthenticated');
      if (!isAuthenticated) {
        this.set('showLoginPopUp', true);
      } else {
        /*Check if the shipping address in the basket is the complete one or not*/
        if (this.get('shoppingBasket').order.address.id === 0 || this.get('shoppingBasket').order.address.id === '0') {
          this.set('showAddressListWhenCheckout', true);
        } else {
          this.set('showAddressListWhenCheckout', false);
        }
        this.set('showLoginPopUp', false);

        let orderCount = this.rappiOrder.get('counter');
        if (orderCount > 0) {
          this.set('orderExist', true);
          return;
        }
        let phone = false;
        if (session.get('currentUser') !== undefined) {
          phone = session.get('currentUser').get("phone") === '' ? true : false;
        }
        this.set('phoneVerification', phone);
        this.set('orderAllowed', isAuthenticated);
      }
    }, resetPhoneVerification: function () {
      this.toggleProperty('phoneVerification');
    }, toggleLogin: function () {
      this.toggleProperty('showLoginPopUp');
    }, togglePopUp: function () {
      this.toggleProperty('orderAllowed');
    }, changeDirection: function () {
      this.toggleProperty('showAddressList');
    }, showAddAddress: function () {
      this.set('showAddressList', false);
      this.toggleProperty('showAddAddress');
    }, emptyBasket: function () {
      this.toggleProperty('showEmptyBasketModal');
    }, orderAlreadyExists: function () {
      this.toggleProperty('orderExist');
    }, showExistingOrder: function () {
      this.toggleProperty('showExistingOrder');
    }, checkAddressValidity(lat, lng) {
      let currentCountry = this.storage.get(stContent) ? this.storage.get(stContent).countryName : ENV.location[0].name;
      var geocoder = new window.google.maps.Geocoder();
      var latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
      geocoder.geocode({'location': latlng}, function (results) {
        var addressComponents = results[0].address_components;
        addressComponents.forEach((component)=> {
          var componentType = component.types;
          if (componentType[0] === 'country') {
            if (component.long_name === currentCountry) {
              alert('sahi address hai');
              return;
            } else {
              alert('galat address hai');
              return;
            }
          }
        });
      });
    }, toggleShowTermConditions: function() {
        this.toggleProperty('showTermConditions');
    }

  }
});
