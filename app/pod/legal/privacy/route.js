import Ember from 'ember';

export default Ember.Route.extend({
  model: function (params) {
    let countryCode = params.countryCode;
    this.controllerFor('legal').set('privacy', true);
    this.controllerFor('legal').set('terms', false);
    if (countryCode === "mx") {
      this.controllerFor('legal').set('privacyMx', true);
      return true;
    } else if((countryCode === "co")) {
      this.controllerFor('legal').set('privacyCol', true);
      return false;
    }else{
      this.transitionTo("legal.privacy", "co");
    }
  }
});
