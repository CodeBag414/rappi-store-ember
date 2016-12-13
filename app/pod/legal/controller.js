import Ember from 'ember';

export default Ember.Controller.extend({
  privacyCol: false,
  privacyMx: false,
  termsCol: false,
  termsMx: false,
  actions: {
    privacy: function (countryCode) {
      this.set("termsCol", false);
      this.set("termsMx", false);
      if (countryCode === "mx") {
        this.transitionToRoute("legal.privacy", "mx");
        this.set("privacyCol", false);
        this.set("privacyMx", true);

      } else {
        this.transitionToRoute("legal.privacy", "co");
        this.set("privacyMx", false);
        this.set("privacyCol", true);
      }
    }, terms: function (countryCode) {
      Ember.$('#privacy-sub-menu').collapse('hide');
      this.set("privacyCol", false);
      this.set("privayMx", false);
      if (countryCode === "mx") {
        this.transitionToRoute("legal.terms", "mx");
        this.set("termsCol", false);
        this.set("termsMx", true);
      } else {
        this.transitionToRoute("legal.terms", "co");
        this.set("termsCol", true);
        this.set("termsMx", false);
      }
    }, collaspeTermsMenu: function () {
      Ember.$('#terms-sub-menu').collapse('hide');
    },
    collaspePrivacyMenu: function () {
      Ember.$('#privacy-sub-menu').collapse('hide');
    }
  }
});
