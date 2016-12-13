import Ember from 'ember';

export default Ember.Controller.extend({
  contactFacebook: null,
  contactTwitter: null,
  init() {
    this._super(...arguments);
    this.set('contactFacebook', this.serverUrl.getDataByCountry()['contact_facebook']);
    this.set('contactTwitter', this.serverUrl.getDataByCountry()['contact_twitter']);
  }
});
