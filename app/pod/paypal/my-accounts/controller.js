import Ember from 'ember';

export default Ember.Controller.extend({
  leftActive: {profile: true, cards: false, address: false, "change-password": false},
  currentlyLoading: false,
  init: function () {
    if (window.location.hash.substring(20) === "profile" || window.location.hash.substring(20) === "cards" || window.location.hash.substring(20) === "address" || window.location.hash.substring(20) === "change-password") {
      this.set('leftActive', {profile: false, cards: false, address: false, "change-password": false});
      Ember.set(this.get('leftActive'), window.location.hash.substring(20), true);
    }
  }
});
