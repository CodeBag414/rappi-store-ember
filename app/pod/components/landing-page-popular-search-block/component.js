import Ember from 'ember';

export default Ember.Component.extend({
  contactFacebook: null,
  contactInstagram: null,
  contactTwitter: null,
  storeType: 'ALL',
  init() {
    this._super(...arguments);
    this.set('contactFacebook', this.serverUrl.getDataByCountry()['contact_facebook']);
    this.set('contactInstagram', this.serverUrl.getDataByCountry()['contact_instagram']);
    this.set('contactTwitter', this.serverUrl.getDataByCountry()['contact_twitter']);
  },
  actions: {
    redirectToFacebook: function () {
      mixpanel.track("Social_facebok");
      var win = window.open("https://www.facebook.com/RappiTienda/", '_blank');
      win.focus();
    },
    redirectToTwitter: function () {
      mixpanel.track("Social_twitter");
      var win = window.open("https://twitter.com/rappicolombia/", '_blank');
      win.focus();
    }, redirectToInstagram: function () {
      mixpanel.track("social_instagram");
      var win = window.open("https://www.instagram.com/rappicolombia/", '_blank');
      win.focus();
    }, redirectToLinkedIn: function () {
      mixpanel.track("social_linkedin");
      var win = window.open("https://www.linkedin.com/company/rappi", '_blank');
      win.focus();
    },
  }
});
