import Ember from 'ember';
import CartItemModel from '../models/cart-item';
import OrderModel from '../models/order';
const {
  computed,
  get,
  set
  } = Ember;

export default Ember.Object.extend(Ember.Evented, {
  cartType: "",
  name: "",
  perShipping: 0,
  minShipping: 0,
  maxShipping: 0,
  cartItems: [],
  whim: {},
  totalUniqueItems: computed.alias('cartItems.length'),
  eventCaptured: false,
  order: null,
  totalItems: function () {
    let cartItems = this.get('cartItems');
    let quantity = 0;
    let products = [];
    cartItems.forEach((obj)=> {
      quantity += obj.get('quantity');
      let extras = obj.get('extras');
      products.pushObject({"id": `${obj.id}`, "sale_type": extras.saleType, "units": obj.quantity});
    });
    let order = this.get('order');
    if (Ember.isEmpty(order)) {
      this.set('order', OrderModel.create({'products': products}));
    } else {
      order.set('products', products);
    }
    return quantity;
  }.property('cartItems.@each.quantity'),

  updateShippingAddress(shippingAddress){
    let address = this.get('order').get('address');
    address.setProperties(shippingAddress);
    this.toggleProperty('eventCaptured');
  },
  updateWhim(whimObj){
    set(this, 'whim', whimObj);
    this.toggleProperty('eventCaptured');
    if (Ember.isPresent(whimObj) && Ember.isPresent(whimObj.text)) {
      this.trigger('whimPushed');
    }
  },
  isWhimAdded(){
    let whim = get(this, 'whim');
    return Ember.isPresent(whim) && Ember.isPresent(whim.text);
  },
  totalPrice: function () {
    let cartItems = this.get('cartItems');
    let price = 0.00;
    cartItems.forEach((obj)=> {
      price += parseFloat(obj.get('totalPrice'));
    });
    return parseInt(price);
  }.property('cartItems.@each.totalPrice'),

  grandTotal: function () {
    return parseInt(this.get('totalPrice') + this.get('shippingCharges'));
  }.property('totalPrice', 'shippingCharges'),

  pushItem(item){
    let cartItem;
    let existingCartItems = get(this, 'cartItems');
    if (Ember.isEmpty(existingCartItems)) {
      set(this, 'cartItems', Ember.A());
      existingCartItems = get(this, 'cartItems');
    }
    if (item.toCartItem) {
      cartItem = item.toCartItem();
    } else {
      cartItem = CartItemModel.create(item);
    }

    let foundCartItem = existingCartItems.findBy('id', get(cartItem, 'id'));

    if (!foundCartItem) {
      existingCartItems.pushObject(cartItem);
    }

    cartItem = foundCartItem || cartItem;

    if (get(cartItem, 'increment') || get(cartItem, 'quantity') === 0) {
      cartItem.incrementProperty('quantity');
    }
    this.toggleProperty('eventCaptured');
    this.trigger('itemPushed');
    return cartItem;
  },

  popItem(item){
    let existingCartItems = get(this, 'cartItems');
    let cartItem;
    if (item.toCartItem) {
      cartItem = item.toCartItem();
    } else {
      cartItem = CartItemModel.create(item);
    }
    this.trigger('itemPoped');
    let foundCartItem = existingCartItems.findBy('id', cartItem.get('id'));
    if (foundCartItem && get(foundCartItem, 'quantity') > 1) {
      foundCartItem.decrementProperty('quantity');
      this.toggleProperty('eventCaptured');
      return foundCartItem;
    } else if (foundCartItem && get(foundCartItem, 'quantity') === 1) {
      foundCartItem.dumpCartItem();
      existingCartItems.removeObject(foundCartItem);
      this.toggleProperty('eventCaptured');
      return null;
    }
  },

  removeItem(item){
    let existingCartItems = get(this, 'cartItems');
    let cartItem;
    if (item.toCartItem) {
      cartItem = item.toCartItem();
    } else {
      cartItem = CartItemModel.create(item);
    }
    let foundCartItem = existingCartItems.findBy('id', cartItem.get('id'));
    if (foundCartItem) {
      foundCartItem.dumpCartItem();
      existingCartItems.removeObject(foundCartItem);
      this.toggleProperty('eventCaptured');
    }
  },
  dumpCart(){
    let cartItems = get(this, 'cartItems');
    cartItems.forEach((item)=> {
      item.dumpCartItem();
    });
  }
})
;
