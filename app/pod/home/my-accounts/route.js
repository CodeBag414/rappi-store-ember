import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin,{
  serverUrl: Ember.inject.service('server-url'),
  session: Ember.inject.service('session'),
  setupController: function (controller, model) {
    this._super(controller, model);
    let currentUrl = this.serverUrl.getUrl();
    controller.set("currentUrl", currentUrl);
  },
  model(){
    return this.get('session').get('currentUser');
  }
});
