import Ember from 'ember';

export default Ember.Component.extend({
  didInsertElement(){
    this._super(...arguments);
    if ($("#video").get(0).paused) {
      setTimeout(function () {
        $("#video").get(0).play();
      }, 200);
    }
  },
  actions: {
    modelActiveAction: function (param) {
      this.set("paypalPanel", false);
      if (param != undefined) {
        this.set("showLogin", true);
      }
    }
  }
});
