import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stStoreType
  } = ENV.storageKeys;

export default Ember.Component.extend({
  searchItems: [],
  willRender() {
    this._super(...arguments);
    let storeType = this.storage.get(stStoreType);
    let storeTypeName;
    if (storeType === "super") {
      storeTypeName = "SUPERMERCADO";
    } else if (storeType === "express") {
      storeTypeName = "TIENDA EXPRESS";
    } else if (storeType === "restaurant") {
      storeTypeName = "RESTAURANTES Y CAFÉS";
    } else if (storeType === "farmacia") {
      storeTypeName = "FARMACIA Y BIENESTAR";
    } else if (storeType === "Antojos y deseos") {
      storeTypeName = "ANTOJOS Y DESEOS";
    }
    this.set("storeTypeName", storeTypeName);
    this.set("storeType", storeType);
  }
});
