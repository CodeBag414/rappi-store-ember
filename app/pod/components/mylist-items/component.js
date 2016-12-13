import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    closeListPopup: function () {
      this.set('showItemDialog', false);
    },
    removeList: function () {
      let popupDialogModel = this.get('popupDialogModel');
      this.sendAction("removeList", popupDialogModel);
    }
  }
});
