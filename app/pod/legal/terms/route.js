import Ember from 'ember';

export default Ember.Route.extend({
  model: function (params) {
    let countryCode = params.countryCode;
    this.controllerFor('legal').set('privacy', false);
    this.controllerFor('legal').set('terms', true);
    if (countryCode === "mx") {
      this.controllerFor('legal').set('termsMx', true);
      return true;
    } else if ((countryCode === "co")) {
      this.controllerFor('legal').set('termsCol', true);
      return false;
    } else {
      this.transitionTo("legal.terms", "co");
    }

  }
});
