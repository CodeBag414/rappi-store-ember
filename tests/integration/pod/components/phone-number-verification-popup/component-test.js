import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('phone-number-verification-popup', 'Integration | Component | phone number verification popup', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{phone-number-verification-popup}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#phone-number-verification-popup}}
      template block text
    {{/phone-number-verification-popup}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
