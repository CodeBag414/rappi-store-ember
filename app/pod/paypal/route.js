import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stStoreType
  } = ENV.storageKeys;

export default Ember.Route.extend({
  serverUrl: Ember.inject.service('server-url'),
  showModalReg: false,
  isLoggedIn: false,
  session: Ember.inject.service('session'),
  url: "",
  init(){
    this._super(...arguments);
    let currentUrl = this.serverUrl.getUrl();
    this.set("url", currentUrl);
  },
  actions: {
    showDialog: function () {
      this.toggleProperty('showModalReg');
    }, logout(){
      this.get('session').set('data.cart', null);
      this.get('session').invalidate();
    }, search: function (queryField) {
      if (Ember.isEmpty(queryField)) {
        this.controller.set('searchData', null);
        this.controller.set('productSearched', null);
        this.controller.set('isSearched', false);
        return;
      }
      let currentUrl = this.serverUrl.getUrl();
      Ember.$.getJSON(`${currentUrl}${ENV.productSearch}ids=${queryField.ids}&stores=${queryField.stores}`)
        .then((rsp)=> {
          this.controller.set('searchItems', rsp);
          this.controller.set('searchItemsName', queryField.name);
          this.controller.set('isSearched', true);
        }).fail((err)=> {
          console.log("err>>", err);
        });
    }, changeStoreType: function (storeType) {
      this.controller.set('searchData', null);
      this.controller.set('productSearched', null);
      this.controller.set('isSearched', false);
      this.controller.set('myAccountAccessed', false);
      this.controller.set('cartObject', this.cart.getCart(storeType));
      if (storeType === 'whim') {
        this.transitionTo('paypal.whims-and-desires');
      } else {
        this.transitionTo('paypal.store', storeType);
      }
    }, basketOpenned(){
      if (window.location.hash.includes("subcorredor")) {
        this.controllerFor('paypal.subcorridor').set('basketOpenned', true);
      } else
      if (window.location.hash.includes("corredor")) {
        this.controllerFor('paypal.corridor').set('basketOpenned', true);
      }
      else if (window.location.hash.includes("whims-and-desires")) {
        this.controllerFor('paypal.whims-and-desires').set('basketOpenned', true);
      }
      else if (window.location.hash.includes("tienda")) {
        this.controllerFor('paypal.store.index').set('basketOpenned', true);
      }
    }
  }
});
