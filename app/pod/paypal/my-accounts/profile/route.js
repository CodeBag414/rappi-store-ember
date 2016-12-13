import Ember from 'ember';

export default Ember.Route.extend({
  session: Ember.inject.service('session'),
  setupController: function (controller, model) {
    this._super(controller, model);
    this.controllerFor('paypal').send('myAccountAccessed');
    controller.set('parentController', this.controllerFor('paypal.my-accounts'));
  },
  model(){
    var currentUser = this.get('session').get('currentUser');
    var tempPhone = currentUser.get("phone");
    if (tempPhone !== undefined) {
      currentUser.set('tempPhone', tempPhone);
    }
    return currentUser;
  }
});
