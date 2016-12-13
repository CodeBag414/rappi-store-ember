import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    createList: function() {
      this.get('router').transitionTo('home.list', 123);
    },
    closeCreateList: function() {
      this.set('showCreateListDialog', false);
    }
  }
});
