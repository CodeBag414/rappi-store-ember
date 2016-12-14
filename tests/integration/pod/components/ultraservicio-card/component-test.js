import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ultraservicio-card', 'Integration | Component | ultraservicio card', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{ultraservicio-card}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#ultraservicio-card}}
      template block text
    {{/ultraservicio-card}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
