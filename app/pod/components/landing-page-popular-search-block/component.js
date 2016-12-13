import Ember from 'ember';

export default Ember.Component.extend({
  contactFacebook: null,
  contactInstagram: null,
  contactTwitter: null,
  storeType:'ALL',
  init() {
    this._super(...arguments);
    this.set('contactFacebook', this.serverUrl.getDataByCountry()['contact_facebook']);
    this.set('contactInstagram', this.serverUrl.getDataByCountry()['contact_instagram']);
    this.set('contactTwitter', this.serverUrl.getDataByCountry()['contact_twitter']);
  },
});
