import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('credit-card-iframe-popup', 'Integration | Component | credit card iframe popup', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  //this.render(hbs`{{credit-card-iframe-popup}}`);
  this.set("redirectURL", "a/b");

  // Template block usage:
  this.render(hbs`
    {{#credit-card-iframe-popup redirectURL="http://jsoneditoronline.org"}}
      template block text
    {{/credit-card-iframe-popup}}
  `);

  assert.equal(this.$("#iframeButton").text().trim(),'Guardar', 'template block text');

  assert.equal(this.$("iframe").attr("src"),"http://jsoneditoronline.org", "url test");
  assert.equal(this.$("iframe").attr("width"),"745", "width test");
  assert.equal(this.$("iframe").attr("height"),"380", "height test");
  assert.equal(this.$("iframe").attr("frameborder"),"0", "frameborder test");
  assert.equal(this.$("iframe").attr("allowtransparency"),"true", "allowtransparency test");
  this.$('#iframeButton').click();
});
