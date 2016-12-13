import Ember from 'ember';

export default Ember.Controller.extend({
  showItemDialog: false,
  popupDialogModel: [],
  actions: {
    showListItemDialog: function (listItemId) {
      this.popupDialogModel = this.get("formatedList")[listItemId];
      this.toggleProperty('showItemDialog');
    },
    closeListItemDialog: function () {
      this.toggleProperty('showItemDialog');
    },
    removeList: function (id) {
      id.destroyRecord({id: id.id}).then(function (response) {
        console.log("response", response);
      }, function (error) {
        console.log("error", error);

      });
    }
  }
});
