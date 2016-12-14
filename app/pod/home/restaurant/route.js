import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stLat,
  stLng,
  stStoreType,
  stContent,
  stShippingCharges,
  stStoreId
  } = ENV.storageKeys;

export default Ember.Route.extend({
  storage: Ember.inject.service('storage'),
  serverUrl: Ember.inject.service('server-url'),
  session: Ember.inject.service('session'),
  shuffle: function (array) {
    var copy = [], n = array.length, i;

    // While there remain elements to shuffle…
    while (n) {

      // Pick a remaining element…
      i = Math.floor(Math.random() * n--);

      // And move it to the new array.
      copy.push(array.splice(i, 1)[0]);
    }

    return copy;
  },
  setupController: function (controller, model) {
    this._super(controller, model);
    let stores = model.restaurants.stores;
    let modelPopularProducts= model.restaurants.popular_products || [];
    if (Object.prototype.toString.call(stores) === '[object Object]') {
      stores = Ember.$.map(stores, (value)=> {
        return [value];
      });
    }
    let categories = [];
    stores.forEach((storeList) => {
      var category = storeList[0].category;
      category.stores = storeList;
      categories.push(category);
    });
    controller.set('categories', categories);
    var popular_products = [];
    modelPopularProducts.forEach((popular_product) => {
      if (popular_product.image !== "NO-IMAGE") {
        popular_products.push(popular_product);
      }
    });
    popular_products = this.shuffle(popular_products);

    var recommendedProducts = [];
    popular_products.forEach((product) => {
      if (product.price > 15000) {
        recommendedProducts.push(product);
      }
    });
    controller.set('recommendedProducts', recommendedProducts.slice(0, 50));
    window.scrollTo(0, 0);
  },
  model: function (params) {

    let lat = this.storage.get(stLat);
    let lng = this.storage.get(stLng);
    let currentUrl = this.serverUrl.getUrl();

    let redirect = false;

    this.storage.set(stStoreId, null);

    if (redirect) {
      this.transitionTo('home.store', ENV.defaultStoreType);
      return;
    } else if (Ember.isEmpty(lat) && Ember.isEmpty(lng)) {
      this.transitionTo('index');
      return;
    }

    return new Ember.RSVP.Promise(function (resolve, reject) {
      Ember.RSVP.hashSettled({
        statusApplication: Ember.$.getJSON(`${currentUrl}${ENV.statusApplication}&lat=${lat}&lng=${lng}`),
        restaurants: Ember.$.getJSON(`${currentUrl}api/web/stores/restaurant?lat=${lat}&lng=${lng}`)
      }).then(function (hashResult) {
        var objectToResolve = {};
        Object.keys(hashResult).forEach(function (key) {
          if (hashResult[key].state === 'fulfilled') {
            objectToResolve[key] = hashResult[key].value;
          } else if (key === 'popularSearch') {
            objectToResolve[key] = [];
          } else if (key === 'restaurants') {
            objectToResolve[key] = {stores: [], popular_stores: [], popular_products: []};
          } else {
            reject(hashResult[key]);
          }
        });
        resolve(objectToResolve);
      }).catch(function (error) {
        reject(error);
      });
    });
  }, actions: {
    newCartAdded: function (cart) {
      this.controllerFor('home').send('newCartAdded', cart);
    }, loading(transition) {
      let controller = this.controllerFor('home');
      controller.set('currentlyLoading', true);
      transition.promise.finally(function () {
        controller.set('currentlyLoading', false);
      });
    }, seeAll(route, corridorId, storeId){
      this.storage.set(stStoreId, storeId);
      this.transitionTo(route, corridorId);
    }, back(){
      history.back();
    }
  }
});
