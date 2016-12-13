import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('mexico-landing-page-block', 'Integration | Component | mexico landing page block', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{mexico-landing-page-block}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#mexico-landing-page-block}}
      template block text
    {{/mexico-landing-page-block}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
