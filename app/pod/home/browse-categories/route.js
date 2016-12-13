import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stLat,
  stLng
  } = ENV.storageKeys;

export default Ember.Route.extend({
  storage: Ember.inject.service('storage'),
  setupController: function (controller, model) {
    this._super(controller, model);
    var superMarket = model.superMarket;
    var expressStore = model.express;
    var farmatado = model.farmacia;
    superMarket.forEach((superObj)=> {
      if (superObj.corridors.length > 0) {
        controller.set('superCorridors', superObj.corridors);
      }
    });
    expressStore.forEach((expressObj)=> {
      if (expressObj.corridors.length > 0) {
        controller.set('expressCorridors', expressObj.corridors);
      }
    });
    farmatado.forEach((pharmacyObj)=> {
      if (pharmacyObj.corridors.length > 0) {
        controller.set('farmatadoCorridors', pharmacyObj.corridors);
      }
    });
  },
  model: function () {
    let lat = this.storage.get(stLat);
    let lng = this.storage.get(stLng);
    let superMarket = 'super';
    let express = 'express';
    let farmacia = 'Farmatodo';

    if (Ember.isEmpty(lat) && Ember.isEmpty(lng)) {
      window.scrollTo(0, 0);
      return;
    }
    return new Ember.RSVP.Promise(function (resolve, reject) {
      Ember.RSVP.hashSettled({
        superMarket: Ember.$.getJSON(`${ENV.rappiServerURL}${ENV.byLocation}?lat=${lat}&lng=${lng}&store_type=${superMarket}`),
        express: Ember.$.getJSON(`${ENV.rappiServerURL}${ENV.byLocation}?lat=${lat}&lng=${lng}&store_type=${express}`),
        farmacia: Ember.$.getJSON(`${ENV.rappiServerURL}${ENV.byLocation}?lat=${lat}&lng=${lng}&store_type=${farmacia}`),
      }).then(function (hashResult) {
        var objectToResolve = {};
        Object.keys(hashResult).forEach(function (key) {
          if (hashResult[key].state === 'fulfilled') {
            objectToResolve[key] = hashResult[key].value;
          } else if (key === 'popularSearch') {
            objectToResolve[key] = [];
          } else {
            reject(hashResult[key]);
          }
        });
        resolve(objectToResolve);
      }).catch(function (error) {
        reject(error);
      });
    })
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
