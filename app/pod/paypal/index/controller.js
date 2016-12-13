import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['locationId', 'customerId', 'tabId', 'isNative', 'device', 'appVersion', 'locale_x'],
  init(){
    this._super(...arguments);
  },
  actions: {
    toggleAddAddress: function () {
      this.set('showAddressListToUpdate', false);
      this.toggleProperty('showAddAddressToUpdate');
    },
    toggleAddressList: function () {
      this.set('showAddressListToUpdate', false);
    }
  }
});
