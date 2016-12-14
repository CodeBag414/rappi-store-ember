/**
 * Created by daffodil on 04/7/16.
 */
import Ember from 'ember';
import RappiOrderModel from '../models/rappi-order';
import ENV from 'rappi/config/environment';
const {
  ArrayProxy,
  computed,
  } = Ember;

const get = Ember.get;

export default ArrayProxy.extend({
  isServiceFactory: true,
  serverUrl: Ember.inject.service('server-url'),
  rappiOrderProperties: ['id', 'state', 'address_description', 'tip', 'total_value', 'application_user_id', 'comment', 'eta','eta_starts_at', 'payment_method', 'products', 'address', 'total_charges', 'total_products', 'storekeeper', 'whim'],
  rappiOrderEventProperties: ['id', 'state', 'eta', 'storekeeper','eta_starts_at'],
  getOrderPayLoad(order){
    let payload = {};
    this.rappiOrderProperties.forEach((prop)=> {
      payload[prop] = order[prop];
    });
    return payload;
  },
  getOrderPayLoadForEvent(order){
    let payload = {};
    this.rappiOrderEventProperties.forEach((prop)=> {
      payload[prop] = order[prop];
    });
    return payload;
  },
  pushOrderFromEvent(order) {
    order = RappiOrderModel.create(this.getOrderPayLoadForEvent(order));
    let orderFound = this.findBy('id', get(order, 'id'));
    if (orderFound) {
      if ("finished" === get(order, 'state')) {
        this.removeObject(orderFound);
      } else {
        orderFound.setProperties(order.getProperties(this.rappiOrderEventProperties));
      }
    }
  },
  pushOrder(order) {
    order = RappiOrderModel.create(this.getOrderPayLoad(order));
    let orderFound = this.findBy('id', get(order, 'id'));
    if (orderFound) {
      orderFound.setProperties(order.getProperties(this.rappiOrderProperties));
    } else {
      this.pushObject(order);
    }
    return orderFound || order;
  },
  getOrder(key, value){
    let order = RappiOrderModel.create({[key]: value});
    let orderFound = this.findBy(key, get(order, key));
    if (orderFound) {
      return orderFound;
    }
  }, removeOrder(orderId){
    let order = RappiOrderModel.create({id: orderId});
    let orderFound = this.findBy('id', get(order, 'id'));
    if (orderFound) {
      orderFound.trigger('orderRemoved');
      this.removeObject(orderFound);
    }
  },
  syncOrder(accessToken, currentUrl){
    let _this = this;
    return Ember.$.ajax({
      type: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      dataType: 'json',
      url: `${currentUrl}${ENV.orderStatus}`,
    }).then((orders)=> {
      if (Ember.isPresent(orders)) {
        orders.forEach(function (orderObj) {
          _this.pushOrder(orderObj);
        });
      }
    });
  },
  isEmpty: computed.empty('content'),
  isNotEmpty: computed.not('isEmpty'),
  counter: computed.alias('length')
});
