import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('product-detail', 'Integration | Component | product detail', {
  integration: true
});

test('it renders', function (assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.set('isShowingModal', true);
  this.set('productInfo', {
    "id": "471_42606",
    "name": "Gaseosa Coca Cola",
    "image": "42606.png",
    "description": "Coca Cola Light, 300 Mililitro(s).",
    "width": 124,
    "height": 380,
    "cm_height": "20",
    "cm_width": "6.52632",
    "hook_x": null,
    "hook_y": null,
    "area_type_id": 1,
    "new_photo": false,
    "controlled": false,
    "trademark": "Coca Cola",
    "active": true,
    "unit_type": "ML",
    "created_at": "2015-11-19 09:17:29",
    "updated_at": "2016-06-17 21:08:33",
    "deleted_at": null,
    "optional_quantity": null,
    "type": "Gaseosa",
    "quantity": "300",
    "presentation": "BOTX1",
    "age_restriction": false,
    "label": null,
    "category_product_type": 1,
    "sale_type": "U",
    "max_quantity_in_grams": null,
    "min_quantity_in_grams": null,
    "step_quantity_in_grams": null,
    "retail_id": "42606",
    "ean": "77093189",
    "image_high": "uploads/products/high/42606.png",
    "image_medium": "uploads/products/medium/42606.png",
    "image_low": "uploads/products/low/42606.png",
    "price": "1700.00"
  });
  this.set('isProductAdded', true);
  this.set('addToCart', (actual) => {
    let expected = {comment: 'You are not a wizard!'};
    assert.deepEqual(actual, expected, 'submitted value is passed to external action');
  });
  this.render(hbs`{{product-detail isShowingModal=isShowingModal product=productInfo isProductAdded=isProductAdded addToCart=(action addToCart)}}`);

  assert.equal(this.$('h1').text().trim(), "Gaseosa Coca Cola","Product Name");
  assert.equal(this.$('span').text(), "BOTX1$1700.00","Product Price");
  assert.equal(this.$('p').text(), "Coca Cola Light, 300 Mililitro(s).","Product Description");
  assert.equal(this.$('button').attr('disabled'), "disabled","Button Disabled");
  assert.equal(this.$('img').attr('src'), "/uploads/products/high/42606.png","Image URL");
  this.$('a').click();
  assert.equal(this.get('isShowingModal'),false,"Close Detail Popup on cross button click");
  this.$('button').click();
  assert.equal(this.get('isShowingModal'),false,"Close Detail Popup on button click");
  this.set('isProductAdded', false);
  assert.equal(this.$('button').attr('disabled'), undefined,"Button Enabled");

  // Template block usage:
  //this.render(hbs`
  //  {{#product-detail}}
  //    template block text
  //  {{/product-detail}}
  //`);
  //
  //assert.equal(this.$().text().trim(), 'template block text');
});
