import Ember from 'ember';

export default Ember.Route.extend({
  serverUrl: Ember.inject.service('server-url'),
  setupController: function (controller, model) {
    this._super(controller, model);
    let currentUrl = this.serverUrl.getUrl();
    controller.set("currentUrl", currentUrl);
    this.controllerFor('home').send('myAccountAccessed');
    controller.set('parentController', this.controllerFor('home.my-accounts'));
  },
  model() {
    return this.get('session').get('currentUser');
  }
})
;
