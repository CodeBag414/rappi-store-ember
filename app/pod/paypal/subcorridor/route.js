import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stContent,
  stStoreType,
  stStoreId
  } = ENV.storageKeys;

/** Product pivot id (Coca-cola)*/
const PRODUCT_PIVOTE_ID = '42606';
const PRODUCT_PIVOTE_ID_MX = '10621';

export default Ember.Route.extend({
  serverUrl: Ember.inject.service('server-url'),
  setupController: function (controller, model) {
    this._super(controller, model);
    var storeType = this.storage.get(stStoreType);
    let storeId = this.storage.get(stStoreId);
    if (Ember.isEmpty(storeId)) {
      this.transitionTo('paypal.store', storeType);
      return;
    }
    controller.set("mobileView", false);
    let storeTypes = {
      'super': 'SUPERMERCADO',
      'express': 'TIENDA EXPRESS',
      'restaurant': 'RESTAURANTES Y CAFÉS',
      'Farmatodo': 'FARMACIA Y BIENESTAR',
      'Antojos y deseos': 'ANTOJOS Y DESEOS'
    };
    controller.set('isRestaurant', storeType === "restaurant");
    if (storeType === "restaurant") {
      let imageBase = this.serverUrl.getUrl() + `${ENV.rappiWebBaseImage}`;
      controller.set('background', imageBase + ENV.rappiWebRestaurantBackgroundImage + model.subcorridor.corridor.store_id + ".jpg");
      controller.set('logo', imageBase + ENV.rappiWebRestaurantLogoImage + model.subcorridor.corridor.store_id + ".png");
      model.subcorridor.products.reverse();
    }
    storeType = storeTypes[storeType];
    controller.set("storage", this.storage.get(stContent));
    controller.set('storeTypeName', storeType);

    this.set('corridorId', model.subcorridor.corridor_id);
    controller.set('backupProducts', model.subcorridor.products);

    var products = model.subcorridor.products;
    products.forEach(function (product, index) {
      var productId = product.id;
      /*** Remove Product pivot */
      if ( (productId.split('_')[1] === PRODUCT_PIVOTE_ID || productId.split('_')[1] === PRODUCT_PIVOTE_ID_MX)
        && index === 0) {
        products.removeObject(product);
      }
      product.store_id = storeId;
      /*** Add store id if not found in product id */
      if (productId.indexOf('_') < 0) {
        product.id = `${storeId}_${productId}`;
      } else if (productId.split('_')[0] !== storeId.toString()) {
        product.id = `${storeId}_${productId.split('_')[1]}`;
      }
    });

    window.scrollTo(0, 0);

    Ember.run.schedule('afterRender', this, function () {
      this._setNumOfProducts();
    });
    Ember.$(window).bind('resize', ()=> {
      this._setNumOfProducts();
    });

  },
  _setNumOfProducts() {
    this.controller.set("mobileView", false);
    if (Ember.$(window).width() < 1080) {
      $(".col-product").addClass("product-padding");
      $(".col-product").removeClass("col-product");
    }else{
      $(".product-padding").addClass("col-product");
      $(".product-padding").removeClass("product-padding");
    }

    if (Ember.$(window).width() < 780) {
      this.controller.set("mobileView", true);
    }
  },
  model: function (params) {
    let subcorridorId = params.subcorridor_id;
    this.set('setCorridorId', subcorridorId);
    if (!subcorridorId) {
      return;
    }
    this.set('subcorridorId', subcorridorId);
    let currentUrl = this.serverUrl.getUrl();
    return Ember.RSVP.hash({
      subcorridor: Ember.$.getJSON(`${currentUrl}api/web/stores/sub_corridor/${subcorridorId}`)
    });
  },
  actions: {
    loading(transition) {
      let controller = this.controllerFor('paypal');
      controller.set('currentlyLoading', true);
      transition.promise.finally(function () {
        controller.set('currentlyLoading', false);
      });
    },
    change: function () {
      this.controller.set('cartObject', this.cart.getCart(this.storage.get(stStoreType)));
      this.transitionTo('paypal.store', this.storage.get(stStoreType));
    }, showLoginPopUp(){
      this.controllerFor('paypal').set('showLogin', true);
    }
  }
});
