import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('subcorridor-block', 'Integration | Component | subcorridor block', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{subcorridor-block}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#subcorridor-block}}
      template block text
    {{/subcorridor-block}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
