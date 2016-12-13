import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('mexico-footer-block', 'Integration | Component | mexico footer block', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{mexico-footer-block}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#mexico-footer-block}}
      template block text
    {{/mexico-footer-block}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
