import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stContent,
  stStoreType,
  stStoreId,
  stLat,
  stLng
  } = ENV.storageKeys;

export default Ember.Route.extend({
  serverUrl: Ember.inject.service('server-url'),
  setupController: function (controller, model) {
    this._super(controller, model);
    this.storage.set(stStoreType, "restaurant");
    if (model.burgerday.category_products.length == 0) {
      controller.set('products', []);
    } else {
      let products = model.burgerday.category_products[0].products;
      let filteredProducts = [];
      products.forEach((product) => {
        if (product.image !== "NO-IMAGE") {
          filteredProducts.push(product);
        }
      });
      controller.set('products', filteredProducts);
    }
  },
  model: function (params) {
    let lat = this.storage.get(stLat);
    let lng = this.storage.get(stLng);
    let currentUrl = this.serverUrl.getUrl();
    return Ember.RSVP.hash({
      burgerday: Ember.$.getJSON(`${currentUrl}api/web/stores/burger_day?lat=${lat}&lng=${lng}`)
    });
  },
  actions: {
    loading(transition) {
      let controller = this.controllerFor('home');
      controller.set('currentlyLoading', true);
      transition.promise.finally(function () {
        controller.set('currentlyLoading', false);
      });
    }
  }
});
