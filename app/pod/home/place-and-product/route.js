import Ember from 'ember';
import ENV from 'rappi/config/environment';

export default Ember.Route.extend({
  serverUrl: Ember.inject.service('server-url'),
  flashMessages: Ember.inject.service(),
  page: 1,
  perPage: 5,
  keyword: null,
  actions: {
    loading(transition) {
      let controller = this.controllerFor('home');
      let controller1 = this.controllerFor('index');
      controller.set('currentlyLoading', true);
      controller1.set('currentlyLoading', true);
      transition.promise.finally(function () {
        controller.set('currentlyLoading', false);
        controller1.set('currentlyLoading', false);
      });
    },
  },
  setupController: function (controller, model) {
    this._super(controller, model);
    let keyword = this.get('keyword');
    controller.set('keyword', keyword);
  }
});
