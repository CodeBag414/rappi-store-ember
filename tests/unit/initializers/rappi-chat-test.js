import Ember from 'ember';
import RappiChatInitializer from 'rappi/initializers/rappi-chat';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | rappi chat', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  RappiChatInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
