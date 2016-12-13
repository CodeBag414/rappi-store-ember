import Ember from 'ember';

export default Ember.Component.extend({
  showPromo: true,
    actions: {
    cancelOrder: function () {
      this.sendAction("orderCancelRequest");
    }
  }
});
