import Ember from 'ember';
import ENV from 'rappi/config/environment';
const {
  stLat,
  stLng
  } = ENV.storageKeys;

export default Ember.Route.extend({
  afterModel(model){
    if (Ember.isEmpty(model)) {
      this.controllerFor('paypal.store.index').set('redirectToAll', true);
      this.transitionTo('paypal.store.index', this.get('storeType'));
    }else{
      this.controllerFor('paypal.store.all').set('storeTypeName', this.get('storeType'));
      this.controllerFor('paypal.store.index').set('redirectToAll', false);
    }
  },
  model(params){
    let storeType = params.store_id;
    let lat = this.storage.get(stLat);
    let lng = this.storage.get(stLng);
    let redirect = false;
    if (ENV.availableStoreTypes.indexOf(storeType) < 0) {
      redirect = true;
      return;
    }
    if (Ember.isEmpty(lat) && Ember.isEmpty(lng)) {
      this.transitionTo('index');
      return;
    } else if (redirect) {
      this.transitionTo('paypal.store', ENV.defaultStoreType);
      return;
    } else if (storeType !== 'restaurant') {
      this.transitionTo('paypal.store', storeType);
      return;
    }
    this.set('storeType', storeType);
    return this.modelFor('paypal.store.index');
  }
});
