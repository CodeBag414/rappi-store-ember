import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('login-register/recover-password', 'Integration | Component | login register/recover password', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{login-register/recover-password}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#login-register/recover-password}}
      template block text
    {{/login-register/recover-password}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
