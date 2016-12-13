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

export default Ember.Route.extend({

  init() {
    this._super(...arguments);

  },
  model: function(params) {

  }
});
