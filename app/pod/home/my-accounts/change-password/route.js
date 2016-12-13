import Ember from 'ember';

export default Ember.Route.extend({
  setupController: function (controller, model) {
    this._super(controller, model);
    this.controllerFor('home').send('myAccountAccessed')
    controller.set('parentController', this.controllerFor('home.my-accounts'));
  }
});
