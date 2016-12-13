import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('mexico-header-menu', 'Integration | Component | mexico header menu', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{mexico-header-menu}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#mexico-header-menu}}
      template block text
    {{/mexico-header-menu}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
