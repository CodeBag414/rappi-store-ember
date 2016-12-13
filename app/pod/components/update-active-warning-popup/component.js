import Ember from 'ember';

export default Ember.Component.extend({
  updateProcess: false,
  actions: {
    closePopup: function () {
      this.set('showWarning', false);
    }, proceedToUpdate: function () {
      this.set("updateProcess", true);
      this.set('showWarning', false);
      this.sendAction('updateActiveAddress');
    }
  }
});

