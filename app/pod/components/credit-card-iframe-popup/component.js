import Ember from 'ember';

export default Ember.Component.extend({
  creditCardWisth: 745,
  init(){
    this._super(...arguments);
    var width = Ember.$(window).width();
    if (width < this.get('creditCardWisth')) {
      this.set('creditCardWisth', (width - 20));
    }

  },
  actions: {
    loaded: function () {
      this.sendAction('iFrameLoaded');
    },
    creditCardClose: function () {
      this.set("creditCard", false);
      this.sendAction('getCards');
    }
  }
});
