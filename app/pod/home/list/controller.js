import Ember from 'ember';

export default Ember.Controller.extend({
  products: [],
  isEmpty: true,
  init(){
    this._super(...arguments);
  },
  actions: {
    addProduct: function(id, name) {
      let product = {
        id: id,
        name: name,
        quantity: 1
      };
      var products = this.get('products');
      products.pushObject(product);
      this.set('products', products);
      console.log(products);
      if (this.get('isEmpty')) {
        this.set('isEmpty', false);
      }
    },
    goToLists: function() {
      this.transitionToRoute('home.lists');
    }
  }
});
