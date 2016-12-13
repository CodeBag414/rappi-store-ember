import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('popular-restaurants', 'Integration | Component | popular restaurants', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{popular-restaurants}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#popular-restaurants}}
      template block text
    {{/popular-restaurants}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
