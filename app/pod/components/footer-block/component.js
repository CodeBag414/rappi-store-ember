import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stContent
  } = ENV.storageKeys;
export default Ember.Component.extend({

  actions: {
    changeStoreType: function (storeType) {
      this.sendAction('changeStoreType', storeType);
    },
    privacy: function () {
      this.scrollToTop();
      let countryCode = this.storage.get(stContent) ? this.storage.get(stContent).code : "CO";
      if (countryCode === "CO") {
        this.get('router').transitionTo("legal.privacy", "co");
      } else {
        this.get('router').transitionTo("legal.privacy", "mx");
      }
    },
    terms: function () {
      this.scrollToTop();
      let countryCode = this.storage.get(stContent) ? this.storage.get(stContent).code : "CO";
      if (countryCode === "CO") {
        this.get('router').transitionTo("legal.terms", "co");
      } else {
        this.get('router').transitionTo("legal.terms", "mx");
      }
    }
  }, scrollToTop: function () {
    Ember.$("html, body").animate({scrollTop: 0}, "slow");
  }
});
