import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('landing-page-popular-search-block', 'Integration | Component | landing page popular search block', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{landing-page-popular-search-block}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#landing-page-popular-search-block}}
      template block text
    {{/landing-page-popular-search-block}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
