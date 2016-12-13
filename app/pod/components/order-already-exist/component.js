import Ember from 'ember';

export default Ember.Component.extend({
  showPopup: false,
  showExistingOrder:false,
  actions: {
    toggleView: function () {
      this.toggleProperty('showPopup');
    }, showOrder: function () {
      this.set('showPopup', false);
      this.sendAction('showExistingOrder');
    }
  }
});
