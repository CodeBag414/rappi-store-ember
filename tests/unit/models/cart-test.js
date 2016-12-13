import { moduleFor, test } from 'ember-qunit';
moduleFor('model:cart', 'Unit | Model | cart', {
  // Specify the other units that are required for this test.
});

test('Cart Model', function (assert) {
  let id = "471_42606";
  let name = "Gaseosa Coca Cola";
  let unitPrice = 1700.00;
  let image = "/uploads/products/low/42606.png";
  let presentation = "BOTX1";
  let storeId = "546";
  let saleType = "U";
  let storeType = 'super';
  let perShipping = 10;
  let minShipping = 200;
  let maxShipping = 0;
  let model = this.subject({
    cartType: storeType, name: storeType, perShipping, minShipping, maxShipping
  });
  assert.equal(model.get('name'), 'super', 'Cart Name');
  assert.equal(model.get('totalUniqueItems'), 0, 'Empty Cart');
  model.pushItem({
    id, name, unitPrice, image, extras: {presentation, storeId, saleType}
  });
  assert.equal(model.get('totalUniqueItems'), 1, 'Unique products count after adding one product');
  assert.equal(model.get('totalItems'), 1, 'Total items in Cart');
  assert.equal(model.get('totalPrice'), 1700.00, 'Total Cart Value');
  assert.equal(model.get('shippingCharges'), 200, 'Shipping Charges on 1700');
  assert.equal(model.get('grandTotal'), 1900, 'Grand total 1700 + 200');

  model.pushItem({
    id, name, unitPrice, image, extras: {presentation, storeId, saleType}
  });
  assert.equal(model.get('totalUniqueItems'), 1, 'Unique products count after adding same product');
  assert.equal(model.get('totalItems'), 2, 'Total items in Cart after adding same product');
  assert.equal(model.get('totalPrice'), 3400.00, 'Total Cart Value after adding same product');
  assert.equal(model.get('shippingCharges'), 340, 'Shipping Charges on 3400');
  assert.equal(model.get('grandTotal'), 3740, 'Grand total 3400 + 340');

  id = "471_42607";

  model.pushItem({
    id, name, unitPrice, image, extras: {presentation, storeId, saleType}
  });
  assert.equal(model.get('totalUniqueItems'), 2, 'Unique products count after adding different product');
  assert.equal(model.get('totalItems'), 3, 'Total items in Cart after adding different product');
  assert.equal(model.get('totalPrice'), 5100.00, 'Total Cart Value after adding different product');

// let store = this.store();
//  assert.ok(!!model);
})
;
