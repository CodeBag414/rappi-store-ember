import Ember from 'ember';

export default Ember.Controller.extend({
  removedProductId: null,
  isCartRemoved: false,
  cartObject: null,
  basketOpenned: false,
  actions: {
    setRemovedProductId(productId){
      this.set('removedProductId', productId);
    }, setCartRemoved: function () {
      this.set('isCartRemoved', true);
      this.set('cartObject', null);
      let _this = this;
      Ember.run.later(function () {
        _this.set('isCartRemoved', false);
      }, 2000);
    }
  }
});
