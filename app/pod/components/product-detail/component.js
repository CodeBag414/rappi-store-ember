import Ember from 'ember';

export default Ember.Component.extend({
  serverUrl: Ember.inject.service('server-url'),
  url: "",
  init(){
    this._super(...arguments);
    let currentUrl = this.serverUrl.getUrl();
    this.set("url", currentUrl);
  },
  didInsertElement(){
    this._super(...arguments);
    $("#productImageHigh").wrap('<span style="display:inline-block"></span>')
      .css('display', 'block')
      .parent()
      .zoom({magnify:1.5});
    $("#productimagehigh").wrap('<span style="display:inline-block"></span>')
      .css('display', 'block')
      .parent()
      .zoom({magnify:1.5});
  },
  actions: {
    close: function () {
      this.set('isShowingModal', false);
    },
    addToCart: function (product) {
      this.set('isShowingModal', false);
      this.sendAction('addToCart', product);
    }
  }
});
