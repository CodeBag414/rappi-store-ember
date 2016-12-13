import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('recommend-product-card', 'Integration | Component | recommend product card', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{recommend-product-card}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#recommend-product-card}}
      template block text
    {{/recommend-product-card}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
