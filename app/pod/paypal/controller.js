import Ember from 'ember';

export default Ember.Controller.extend({
  searchData: null,
  productSearched: null,
  isSearched: false,
  cartObject: null,
  showOrderPanel: false,
  myAccountAccessed: false,
  removedProductId: null,
  isCartRemoved: false,
  showOrderList: false,
  showLogin: false,
  showLeftMenu: false,
  showAddressListToUpdate: false,
  showAddAddressToUpdate: false,
  loadingImg:false,
  flashMessages: Ember.inject.service(),
  actions: {
    cancelConfirmations: function () {
      this.set('confirm', true);
    },
    newCartAdded: function (cart) {
      this.set('cartObject', cart);
    }, cartRemoved: function () {
      this.set('cartObject', null);
    }, showOrderPanel: function () {
      this.toggleProperty('showOrderPanel');
    }, myAccountAccessed: function () {
      this.set('myAccountAccessed', true);
    }, setRemovedProductId(productId) {
      this.set('removedProductId', productId);
    }, setCartRemoved: function () {
      this.set('isCartRemoved', true);
      this.set('cartObject', null);
      let _this = this;
      Ember.run.later(function () {
        _this.set('isCartRemoved', false);
      }, 2000);
    }, showOrderList: function () {
      this.toggleProperty('showOrderList');
    },
    scrollToTop: function () {
      Ember.$("html, body").animate({scrollTop: 0}, "slow");
    }, showLogin: function () {
      this.toggleProperty('showLeftMenu');
      Ember.$("#nav-icon1").toggleClass('open');
      Ember.$(".wrapper").toggleClass('nav-triggered');
      this.toggleProperty('showLogin');
    }, toggleAddressList: function () {
      this.set('showAddressListToUpdate', false);
    }, toggleAddAddress: function () {
      this.set('showAddressListToUpdate', false);
      this.toggleProperty('showAddAddressToUpdate');
    }, toggleCoupon: function () {
      this.toggleProperty('showLeftMenu');
      Ember.$("#nav-icon1").toggleClass('open');
      Ember.$(".wrapper").toggleClass('nav-triggered');
      this.toggleProperty('showModalCoupon');
    }
  },
  init() {
    this._super(...arguments);
    Ember.$(window).scroll(function () {
      Ember.$el = Ember.$('#scrolltotop');
      if (Ember.$(this).scrollTop() > 250) {
        Ember.$el.css({'display': 'inline'});
      } else {
        Ember.$el.css({'display': 'none'});
      }
    });
  }
});
