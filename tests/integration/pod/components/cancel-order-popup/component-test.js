import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('cancel-order-popup', 'Integration | Component | cancel order popup', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.render(hbs`{{cancel-order-popup}}`);

  assert.equal(this.$('#orderMessage1').text().trim(), 'Tu pedido ya está siendo tramitado,', 'Order message paragraph tag one');
  assert.equal(this.$('#orderMessage2').text().trim(), 'estámos asignándote un Rappitendero', 'Order message paragraph tag two');
  assert.equal(this.$('#image').attr('src').trim(), 'assets/images/rappitender_mustache.gif', 'Image check');
  assert.equal(this.$('#orderMessage3').text().trim(), 'En menos de dos minutos tendrás un Rappitendero', 'Order message paragraph tag three');
  assert.equal(this.$('#orderMessageButton').text().trim(), '¿CANCELAR PEDIDO?', 'Cancel confirmation Button text');
  assert.equal(this.$('#username').text().trim(), '¡Listo !', 'User name text');

  this.$('#orderMessageButton').click();
});
