import Ember from 'ember';
import ApiServiceInitializer from 'rappi/initializers/api-service';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | api service', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  ApiServiceInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
