import Ember from 'ember';

export default Ember.Component.extend({
  keywords: [],
  init(){
    this._super(...arguments);
    this.set('keywords', ["Carnes rojas", "Quesos", "Cuidado capilar", "Bebidas energéticas", "Granos", "Implementos hogar", "Gaseosas", "Enlatados y conservas",
                        "Medias veladas", "Leche", "Vinos", "Cuidado de la cocina"]);
  }
});
