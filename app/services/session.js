import Ember from 'ember';
import ESASession from "ember-simple-auth/services/session";
import ENV from 'rappi/config/environment';
import DS from 'ember-data';
import SessionService from "ember-simple-auth/services/session";

const {
  stLat,
  stLng,
  stAddress,
  stCountry,
  stStoreType,
  stAddressId,
  stAddrPopupShown
  } = ENV.storageKeys;

export default SessionService;
export default ESASession.extend({
  store: Ember.inject.service(),
  storage: Ember.inject.service(),
  cart: Ember.inject.service(),
  serverUrl: Ember.inject.service('server-url'),
  activeOrderIds: null,
  currentAddress: [],
  invalidate() {
    const session = this.get('session');
    this.get('storage').set(stLat, null);
    this.get('storage').set(stLng, null);
    this.get('storage').set(stAddress, null);
    this.get('storage').set(stCountry, null);
    this.get('storage').set(stStoreType, null);
    this.get('storage').set(stAddressId, null);
    this.get('storage').set(stAddrPopupShown, null);
    this.get('cart').clearAllCarts();
    return session.invalidate(...arguments);
  },
  currentUser: Ember.computed('isAuthenticated', function () {
    if (this.get('isAuthenticated')) {
      let currentUrl = this.get("serverUrl").getUrl();
      let _this = this;
      var accessToken = this.get('data.authenticated.access_token');
      Ember.$.ajax({
        type: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        dataType: 'json',
        url: `${currentUrl}${ENV.orderStatus}`,
      }).then((orders)=> {
        if (Ember.isPresent(orders)) {
          _this.set('activeOrderIds', orders.map(function (orderObj) {
            return _this.rappiOrder.pushOrder(orderObj).get('id');
          }));
        }
        return this.get('store').findAll('address');
      }).then((address)=> {
        if (typeof window.AccountKit !== 'undefined') {
          AccountKit.init({
            appId: ENV.accountKitAppID,
            state: accessToken,
            version: "v1.1"
          });
        }
        _this.set('currentAddress', address);
        _this.trigger('userAddressUpdated', address);
      });
      const promise = this.get('store').queryRecord('user', {});
      return DS.PromiseObject.create({promise: promise});
    }
  })
});
