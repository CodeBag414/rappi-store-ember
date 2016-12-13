import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('most-purchased-dish', 'Integration | Component | most purchased dish', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{most-purchased-dish}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#most-purchased-dish}}
      template block text
    {{/most-purchased-dish}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
