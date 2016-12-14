import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stLat,
  stLng,
  stStoreType
  } = ENV.storageKeys;

export default Ember.Route.extend({
    model: function() {
        this.storage.set(stStoreType, "restaurant");
        this.controllerFor('home').set('storeType', "restaurant");
    }
});
