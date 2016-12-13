import Ember from 'ember';

export default Ember.Component.extend({
  updateProcess: false,
  didRender(){
    var widthDiff = Ember.$(window).width() - 450;
    var widthDiv = widthDiff / 2;
    Ember.$(".overlapPop .popUp-wrapper").css({
      left: widthDiv + 'px',
      'margin-left': '0',
      'margin-top': '0'
    });
  },
  actions: {
    closePopup: function () {
      this.set('showModalTC', false);
    }
  }
});
