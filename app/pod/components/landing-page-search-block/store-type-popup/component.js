import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stLat,
  stLng,
  stContent,
  stStoreType,
  stAddress,
  stShippingCharges,
  stAddressId
  } = ENV.storageKeys;

export default Ember.Component.extend({
  actions: {
    redirectToHome: function (storeType) {
      if (this.get('session').get('isAuthenticated')) {
        let address = this.storage.get(stAddress);
        let lat = this.storage.get(stLat);
        let lng = this.storage.get(stLng);
        let id = this.storage.get(stAddressId);
        let shippingAddress = {
          id: id,
          address: address,
          lat: lat,
          lng: lng
        };
        this.cart.createCart(storeType, this.storage.get(stShippingCharges), shippingAddress);
      }
      this.sendAction("changeStoreType", storeType);
    }
  }
});
