import Ember from 'ember';
import UserServiceInitializer from 'rappi/initializers/user-service';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | user service', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  UserServiceInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
