import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('order-cancel-confirm-popup', 'Integration | Component | order cancel confirm popup', {
  integration: true
});

test('it renders', function (assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  //this.render(hbs`{{order-cancel-confirm-popup}}`);


  // Template block usage:
  this.render(hbs`
    {{#order-cancel-confirm-popup}}
      template block text
    {{/order-cancel-confirm-popup}}
  `);

  assert.equal(this.$("h1").text().trim(), '¿A dónde quieres pedir?', 'h1 text test');
  assert.equal(this.$("button").first().text().trim(), 'NO, CONTINUAR', 'button1 text  test');
  assert.equal(this.$("button").first().attr("class"), 'btn btn-primary', 'button1 class  test');
  assert.equal(this.$("button").last().text().trim(), 'SI, SEGURO', 'button2 text  test');
  assert.equal(this.$("button").last().attr("class"), 'btn btn-green', 'button2 class  test');
  assert.equal(this.$("p").attr("class"), 'btnBox btn-greenMargin padding-popup', 'p class  test');
  //assert.equal(this.$("a").attr("href"), 'javascript:void(0);', 'anchor href  test');
  assert.equal(this.$("a").attr("class"), 'close-global-black', 'anchor class  test');
  this.$('a').click();
});
