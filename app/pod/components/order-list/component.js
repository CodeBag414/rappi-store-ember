import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    showStatus: function (orderId) {
      this.sendAction('showOrderStatus', orderId);
      this.set('showOrderList', false);
    }
  }
});
