import Ember from 'ember';

export default Ember.Component.extend({
  videoPopupWidth: 710,
  init(){
    this._super(...arguments);
    var width = Ember.$(window).width();
    if (width < this.get('videoPopupWidth')) {
      this.set('videoPopupWidth', (width - 20));
    }
  },
  actions: {
    showDialog: function () {
      this.toggleProperty('showModalReg');
    },
    closeLoginPopup: function () {
      this.set('showModalReg', false);
    }
  }
});
