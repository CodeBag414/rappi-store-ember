import Ember from 'ember';

export default Ember.Controller.extend({
  showCreateListDialog: false,
  actions: {
    showCreateListDialog: function() {
      this.toggleProperty('showCreateListDialog');
    }
  }
});
