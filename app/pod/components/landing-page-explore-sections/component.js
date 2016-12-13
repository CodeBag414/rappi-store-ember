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
  scrollToGo: 0,
  init() {
    this._super(...arguments);
    let _this = this;

    Ember.$(window).scroll(function () {
      var scroll = Ember.$(window).scrollTop();

      Ember.$('.banner-container').css('z-index', 99);
      Ember.$('.menu-container').css('z-index', 101);
      Ember.$('.explore-sections').css('z-index', 100);

      if (Ember.$(window).width() < 480) {
        Ember.$('.section-restaurantes div').css('transform', 'translate(-' + ((50 / _this.get('scrollToGo')) * scroll) + 'px, -' + ((50 / _this.get('scrollToGo')) * scroll) + 'px)');
        Ember.$('.section-tiendaexpress div').css('transform', 'translate(-' + ((50 / _this.get('scrollToGo')) * scroll) + 'px, -' + ((50 / _this.get('scrollToGo')) * scroll) + 'px)');
        Ember.$('.section-farmacia div').css('transform', 'translate(-' + ((50 / _this.get('scrollToGo')) * scroll) + 'px, -' + ((50 / _this.get('scrollToGo')) * scroll) + 'px)');
        Ember.$('.section-super div').css('transform', 'translate(-' + ((50 / _this.get('scrollToGo')) * scroll) + 'px, -' + ((50 / _this.get('scrollToGo')) * scroll) + 'px)');
      } else {
        if (_this.get('classToTransform') === '.search-bar-transform-whim') {
          Ember.$('.search-bar-transform').removeAttr('style');
        }else{
          Ember.$('.search-bar-transform-whim').removeAttr('style');
        }
        Ember.$(_this.get('classToTransform')).css('transform', 'translateY(-' + (scroll / 5) + 'px)');
        Ember.$('.caption-container').css('transform', 'translateY(-' + (scroll / 5) + 'px)');
        Ember.$('.section-tiendaexpress div').css('transform', 'translate(-' + ((90 / _this.get('scrollToGo')) * scroll) + 'px, ' + ((80 / _this.get('scrollToGo')) * scroll) + 'px)');
        Ember.$('.section-restaurantes div').css('transform', 'translate(' + ((100 / _this.get('scrollToGo')) * scroll) + 'px, -' + ((50 / _this.get('scrollToGo')) * scroll) + 'px)');
        Ember.$('.section-farmacia div').css('transform', 'translate(-' + ((80 / _this.get('scrollToGo')) * scroll) + 'px, -' + ((70 / _this.get('scrollToGo')) * scroll) + 'px)');
        Ember.$('.section-super div').css('transform', 'translateY(-' + ((100 / _this.get('scrollToGo')) * scroll) + 'px)');
        Ember.$('.section-antojos div').css('transform', 'translate(-' + ((50 / _this.get('scrollToGo')) * scroll) + 'px, -' + ((100 / _this.get('scrollToGo')) * scroll) + 'px)');
      }
    });
  },
  didRender() {
    if (this.get('showBurgerDay')) {
      var scrollToGo = 660 - (Ember.$(window).innerHeight() - 460) / 2;
    } else {
      var scrollToGo = 496 - (Ember.$(window).innerHeight() - 460) / 2;
    }

    this.set("scrollToGo", scrollToGo);
    if (this.get('classToTransform') === '.search-bar-transform-whim') {
      Ember.$('.search-bar-transform').removeAttr('style');
    }else{
      Ember.$('.search-bar-transform-whim').removeAttr('style');
    }
  },
  actions: {
    redirectToHome: function (storeType) {
      //mixpanel events
      if(storeType==="express"){
        mixpanel.track("express_big_button");
      }else if(storeType==="restaurant"){
        mixpanel.track("restaurant_big_button");
      }else if(storeType==="farmacia"){
        mixpanel.track("farmica_big_button");
      }else if(storeType==="super"){
        mixpanel.track("super_big_button");
      }else if(storeType==="whim"){
        mixpanel.track("antojos_big_button");
      }

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
    },
    redirectToBurgerDay() {
      this.sendAction("goToBurgerDay");
    }
  }
});
