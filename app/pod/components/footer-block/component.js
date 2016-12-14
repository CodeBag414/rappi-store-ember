import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stContent
  } = ENV.storageKeys;
export default Ember.Component.extend({
  footerStoreEvents: {
    "express": 'bottom_express',
    "restaurant": 'bottom_restaurant',
    "farmacia": 'bottom_farmacia',
    "super": 'bottom_super'
  },

  actions: {
    changeStoreType: function (storeType) {
      mixpanel.track(this.get('footerStoreEvents')[storeType]);
      this.sendAction('changeStoreType', storeType);
    },
    privacy: function () {
      mixpanel.track("footer_AVISODEPRIVACIDAD");
      this.scrollToTop();
      let countryCode = this.storage.get(stContent) ? this.storage.get(stContent).code : "CO";
      if (countryCode === "CO") {
        this.get('router').transitionTo("legal.privacy", "co");
      } else {
        this.get('router').transitionTo("legal.privacy", "mx");
      }
    },
    terms: function () {
      mixpanel.track("footer_TERMINOSYCONDICIONES");
      this.scrollToTop();
      let countryCode = this.storage.get(stContent) ? this.storage.get(stContent).code : "CO";
      if (countryCode === "CO") {
        this.get('router').transitionTo("legal.terms", "co");
      } else {
        this.get('router').transitionTo("legal.terms", "mx");
      }
    }, quiero: function () {
      mixpanel.track("footer_QUIEROSERRAPPITENDERO");
      var win = window.open("https://www.rappitendero.com/", '_blank');
      win.focus();
    },
    blogLink: function () {
      mixpanel.track("footer_NUESTROBLOG");
      var win = window.open("http://blog.rappi.com/", '_blank');
      win.focus();
    }, nosotros: function () {
      mixpanel.track("footer_TRABAJACONNOSOTROS");
      var win = window.open("https://jobs.lever.co/rappi", '_blank');
      win.focus();
    }
  }, scrollToTop: function () {
    Ember.$("html, body").animate({scrollTop: 0}, "slow");
  }
});
