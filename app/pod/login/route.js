import Ember from 'ember';
import ENV from 'rappi/config/environment';
const {
  stContent,
  } = ENV.storageKeys;
export default Ember.Route.extend({
  beforeModel() {
    this._super(...arguments);
    let content = this.storage.get(stContent);
    if(content !== undefined && content.code === "MX"){
      this.transitionTo('download-app');
      return;
    }
    if (this.get('session').get('isAuthenticated')) {
      this.transitionTo('home.store', ENV.defaultStoreType);
    }
  }
});
