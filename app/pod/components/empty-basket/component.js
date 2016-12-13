import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    closeEmptyBasketPopup: function () {
      this.set('showEmptyBasketModal', false);
    },
    emptyBasket: function (cart) {
      this.cart.removeCart(cart);
      this.set('showEmptyBasketModal', false);
    }
  }
});
