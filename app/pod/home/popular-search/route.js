import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stLat,
  stLng
  } = ENV.storageKeys;

export default Ember.Route.extend({
  model: function (params) {
    let lat = this.storage.get(stLat);
    let lng = this.storage.get(stLng);

    if (Ember.isEmpty(lat) || Ember.isEmpty(lng)) {
      this.transitionTo('index');
      return;
    }
    let storeType = params.storeType;
    if (storeType !== "ALL") {
      return new Ember.RSVP.Promise(function (resolve, reject) {
        Ember.RSVP.hashSettled({
          popularSearch: Ember.$.getJSON(`${ENV.popularSearchServerURL}/rappi/search/get1?limit=16&storeType=${storeType}`),
          popularProductList: Ember.$.getJSON(`${ENV.popularSearchServerURL}/rappi/search/getsorted?storeType=${storeType}`)
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
      });
    } else {
      return new Ember.RSVP.Promise(function (resolve, reject) {
        Ember.RSVP.hashSettled({
          popularProductList: Ember.$.getJSON(`${ENV.popularSearchServerURL}/rappi/search/getsorted`)
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
      });
    }
  },
  afterModel: function () {
    window.scrollTo(0, 0);
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
