import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('schedule-delivery-popup', 'Integration | Component | schedule delivery popup', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{schedule-delivery-popup}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#schedule-delivery-popup}}
      template block text
    {{/schedule-delivery-popup}}
  `);

  //this.$('#no').click();
  //assert.equal(this.$('#no').attr('class'), '', 'active');
});
