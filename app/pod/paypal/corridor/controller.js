import Ember from 'ember';

export default Ember.Controller.extend({
  serverUrl: Ember.inject.service('server-url'),
  url: "",
  isShowingModal: false,
  productInfo: null,
  queryField: '',
  storeType: null,
  lat: null,
  lng: null,
  productSearched: null,
  showModalReg: false,
  session: Ember.inject.service('session'),
  init(){
    this._super(...arguments);
    Ember.run.later(this, function () {
      let currentUrl = this.serverUrl.getUrl();
      this.set("url", currentUrl);
    }, 50);
  },
  actions: {
    toggleModal: function (productInfo) {
      this.toggleProperty('isShowingModal');
      this.set('productInfo', productInfo);
    }, showDialog: function () {
      this.toggleProperty('showModalReg');
    }, logout(){
      this.get('session').invalidate();
    }, click: function () {
      Ember.$('#product-basket').collapse('hide');
      this.set('overflow', false);
      Ember.$("body").css("overflow", "auto");
    }
  }
});
