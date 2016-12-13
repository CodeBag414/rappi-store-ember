import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('restaurant-whims-desires', 'Integration | Component | restaurant whims desires', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{restaurant-whims-desires}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#restaurant-whims-desires}}
      template block text
    {{/restaurant-whims-desires}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
