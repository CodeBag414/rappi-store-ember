import Ember from 'ember';
import ENV from 'rappi/config/environment';
const {
  stLat,
  stLng
  } = ENV.storageKeys;

export default Ember.Route.extend({
  afterModel(model){
    if (Ember.isEmpty(model)) {
      this.controllerFor('home.store.index').set('redirectToAll', true);
      this.transitionTo('home.store.index', this.get('storeType'));
    }else{
      this.controllerFor('home.store.all').set('storeTypeName', this.get('storeType'));
      this.controllerFor('home.store.index').set('redirectToAll', false);
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
      this.transitionTo('home.store', ENV.defaultStoreType);
      return;
    } else if (storeType !== 'restaurant') {
      this.transitionTo('home.store', storeType);
      return;
    }
    this.set('storeType', storeType);
    return this.modelFor('home.store.index');
  }
});
