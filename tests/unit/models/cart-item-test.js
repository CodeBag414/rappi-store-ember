import { moduleFor, test } from 'ember-qunit';

moduleFor('model:cart-item', 'Unit | Model | cart item', {
  // Specify the other units that are required for this test.
});

test('Cart-Item Model', function (assert) {
  let id = "471_42606";
  let name = "Gaseosa Coca Cola";
  let unitPrice = 1700.00;
  let quantity = 2;
  let image = "/uploads/products/low/42606.png";
  let presentation = "BOTX1";
  let storeId = "546";
  let saleType = "U";
  let model = this.subject({
    id, name, unitPrice, quantity, image, extras: {presentation, storeId, saleType}
  });
  assert.equal(model.get('id'), "471_42606", "Product Id", 'Product Id');
  assert.equal(model.get('name'), "Gaseosa Coca Cola", 'Product Name');
  assert.equal(model.get('unitPrice'), 1700.00, 'Product Price');
  assert.equal(model.get('quantity'), 2, 'Product Quantity');
  assert.equal(model.get('image'), "/uploads/products/low/42606.png", "Product Image");
  assert.equal(model.get('extras').presentation, "BOTX1", "Presentation");
  assert.equal(model.get('extras').storeId, "546", "Store Id");
  assert.equal(model.get('extras').saleType, "U", "Sale type");
  assert.equal(model.get('totalPrice'), 3400, "Total Price");
  model.incrementProperty('quantity');
  assert.equal(model.get('quantity'), 3, 'Quantity Incremented');
  assert.equal(model.get('totalPrice'), 5100, 'Total Price After Increment');
  model.decrementProperty('quantity');
  assert.equal(model.get('quantity'), 2, 'Quantity Decremented');
  assert.equal(model.get('totalPrice'), 3400, 'Total Price After Decrement');

  // let store = this.store();
  //assert.ok(!!model);
});
