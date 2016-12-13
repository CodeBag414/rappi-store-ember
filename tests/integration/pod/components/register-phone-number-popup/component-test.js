import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('register-phone-number-popup', 'Integration | Component | register phone number popup', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{register-phone-number-popup}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#register-phone-number-popup}}
      template block text
    {{/register-phone-number-popup}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
