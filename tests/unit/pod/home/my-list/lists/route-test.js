import { moduleFor, test } from 'ember-qunit';

moduleFor('route:home/my-list/lists', 'Unit | Route | home/my list/lists', {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
