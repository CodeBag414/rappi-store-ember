import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('most-popular-dish', 'Integration | Component | most popular dish', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{most-popular-dish}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#most-popular-dish}}
      template block text
    {{/most-popular-dish}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
