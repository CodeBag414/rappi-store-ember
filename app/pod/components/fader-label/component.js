import Ember from 'ember';
export default Ember.Component.extend({
  init(){
    this._super(...arguments);
    Ember.run.later(() => {
      this.set('showFaderLabel', false);
    }, 2000);
  }
});
