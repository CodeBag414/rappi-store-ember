//export function initialize(/* application */) {
//  // application.inject('route', 'foo', 'service:foo');
//}
import CartService from '../services/cart';
import Ember from 'ember';

export function initialize(application) {
  let payload;

  if (window.localStorage.getItem('cart')) {
    payload = window.localStorage.getItem('cart');
    payload = JSON.parse(payload);
  }

  let cart = CartService.create({
    content: Ember.A()
  });

  if (payload ) {
    cart.pushPayload(payload);
  }

  application.register('cart:main', cart, {instantiate: false});
  application.inject('controller', 'cart', 'cart:main');
  application.inject('component', 'cart', 'cart:main');
  application.inject('route', 'cart', 'cart:main');
  application.inject('service', 'cart', 'cart:main');
}

export default {
  name: 'cart',
  initialize
};
