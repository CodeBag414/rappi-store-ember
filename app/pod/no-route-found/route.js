import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel(){
    this.get('router').replaceWith('index');
  }
});
