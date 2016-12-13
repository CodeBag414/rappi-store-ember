import Ember from 'ember';

export default Ember.Controller.extend({
  serverUrl: Ember.inject.service('server-url'),
  url: "",
  storeType: "restaurant",
  showModalReg: false,
  session: Ember.inject.service('session'),
  basketOpenned: false,
  init(){
    this._super(...arguments);
    let currentUrl = this.get("currentUrl");
    this.set("url", currentUrl);
  },
  actions: {
    logout(){
      this.get('session').set('data.cart', null);
      this.get('session').invalidate();
    }, click: function () {
      Ember.$('#product-basket').collapse('hide');
      this.set('overflow', false);
      Ember.$("body").css("overflow", "auto");
    }
  }
});
