import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('landing-page-search-block/store-type-popup', 'Integration | Component | landing page search block/store type popup', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{landing-page-search-block/store-type-popup}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#landing-page-search-block/store-type-popup}}
      template block text
    {{/landing-page-search-block/store-type-popup}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
