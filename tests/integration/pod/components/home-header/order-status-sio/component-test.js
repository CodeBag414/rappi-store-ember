import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('home-header/order-status-sio', 'Integration | Component | home header/order status sio', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{home-header/order-status-sio}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#home-header/order-status-sio}}
      template block text
    {{/home-header/order-status-sio}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
