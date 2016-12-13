/**
 * Created by daffodil on 16/6/16.
 */
import Ember from 'ember';
import ENV from 'rappi/config/environment';

import CartModel from '../models/cart';
import CartItemModel from '../models/cart-item';
import OrderModel from '../models/order';
import ShippingAddressModel from '../models/shipping-address';
const {
  ArrayProxy,
  computed,
  observer,
  on
  } = Ember;

const get = Ember.get;
const set = Ember.set;

export default ArrayProxy.extend({
  //Done
  pushCart(cartType, item) {

    let cart = CartModel.create({name: cartType, cartType});
    let cartFound = this.findBy('cartType', get(cart, 'cartType'));

    if (!cartFound) {
      this.pushObject(cart);
    }
    cart = cartFound || cart;
    return cart.pushItem(item);
  },
  popCart(cartType, item) {
    let cart = CartModel.create({name: cartType, cartType});
    let cartFound = this.findBy('cartType', get(cart, 'cartType'));

    if (cartFound) {
      return cartFound.popItem(item);
    }
  },
  removeItemFromCart(cartType, item) {
    let cart = CartModel.create({name: cartType, cartType});
    let cartFound = this.findBy('cartType', get(cart, 'cartType'));
    if (cartFound) {
      cartFound.removeItem(item);
    }
  },

  clearCart(cartType) {
    let cart = CartModel.create({name: cartType, cartType});
    let cartFound = this.findBy('cartType', get(cart, 'cartType'));
    if (cartFound) {
      cartFound.dumpCart();
      this.removeObject(cartFound);
      this.pushWhim({});
      cart.trigger('cartRemoved');
    }
  },
  removeCart(cart) {
    cart.dumpCart();
    this.pushWhim({});
    this.removeObject(cart);
    cart.trigger('cartRemoved');
  },
  clearAllCarts() {
    this.clear();
    window.localStorage.setItem('cart', null);
  },
  cartItemProperties: ['id', 'name', 'unitPrice', 'quantity', 'increment', 'image', 'extras'],
  cartProperties: ['name', 'cartType', 'cartItems', 'minShipping', 'maxShipping', 'perShipping', 'order', 'whim'],

  //Done
  payload() {
    return this.map((cart) => {
      let cartObj = cart.getProperties(this.cartProperties);
      cartObj.cartItems = cart.get('cartItems').map((item)=> {
        return item.getProperties(this.cartItemProperties);
      });
      return cartObj;
    });
  },

  pushPayload(payload) {
    let _this = this;
    payload.forEach((cartObj) => {
      let cartItems = cartObj.cartItems;
      let cartModel = CartModel.create(cartObj);
      cartItems = cartItems.map((cartItemObj) => {
        return CartItemModel.create(cartItemObj);
      });
      set(cartModel, 'cartItems', cartItems);
      if (Ember.isPresent(cartObj.order) && Ember.isPresent(cartObj.order.address)) {
        let orderModel = OrderModel.create(cartObj.order);
        set(orderModel, 'address', ShippingAddressModel.create(cartObj.order.address));
        set(cartModel, 'order', orderModel);
      } else if (Ember.isPresent(cartObj.order)) {
        let orderModel = OrderModel.create(cartObj.order);
        set(cartModel, 'order', orderModel);
      }
      _this.pushObject(cartModel);
    });
  },
  init(){
    this._super(...arguments);
  },
  getCart(cartType){
    let cart = CartModel.create({name: cartType, cartType});
    let cartFound = this.findBy('cartType', get(cart, 'cartType'));
    if (cartFound) {
      return cartFound;
    }
    return null;
  },
  createCart(cartType, shippingCharges, shippingAddress){
    let cart = CartModel.create({name: cartType, cartType});
    if (Ember.isPresent(shippingCharges)) {
      if (cartType === ENV.defaultStoreType) {
        cart.set('perShipping', shippingCharges.marketPercentageCharge);
        cart.set('minShipping', shippingCharges.marketMinCharge);
      } else {
        cart.set('maxShipping', shippingCharges.nowMaxCharge);
      }
    }
    if (Ember.isPresent(shippingAddress)) {
      let order = OrderModel.create({address: ShippingAddressModel.create(shippingAddress)});
      cart.set('order', order);
    }
    this.pushObject(cart);
    cart.updateWhim(this.getWhim());
    return cart;
  },
  setShippingAddress(cartType, shippingAddress){
    let cart = CartModel.create({name: cartType, cartType});
    let cartFound = this.findBy('cartType', get(cart, 'cartType'));
    if (Ember.isPresent(cartFound)) {
      cartFound.updateShippingAddress(shippingAddress);
    }
  },
  pushWhim(whimObj){
    this.forEach((cart)=> {
      cart.updateWhim(whimObj);
    });
  },
  getWhim(){
    let whimToSend = {};
    this.forEach((cart)=> {
      let whim = get(cart, 'whim');
      if (Ember.isPresent(whim) && Ember.isPresent(whim.text)) {
        whimToSend = whim;
      }
    });
    return whimToSend;
  },
  isEmpty: computed.empty('content'),
  isNotEmpty: computed.not('isEmpty'),

  counter: computed.alias('length'),

  _dumpToLocalStorage: observer('@each.eventCaptured', on('init', function () {
    let a = JSON.stringify(this.payload());
    window.localStorage.setItem('cart', a);
  }))
});
