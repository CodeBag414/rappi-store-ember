import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('update-active-warning-popup', 'Integration | Component | update active warning popup', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{update-active-warning-popup}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#update-active-warning-popup}}
      template block text
    {{/update-active-warning-popup}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
