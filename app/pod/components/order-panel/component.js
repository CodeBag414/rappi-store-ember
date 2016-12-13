import Ember from 'ember';
import ENV from 'rappi/config/environment';

export default Ember.Component.extend({
  isOrderCreated: false,
  isOrderTaken: false,
  orderRatePanel: false,
  orderObj: null,
  isOrderCancelRequested: false,
  socketIOService: Ember.inject.service('socket-io'),
  isChatOn: false,
  rappiWebSocketURL: null,
  currentOrderId: null,
  init(){
    this._super(...arguments);
    this.set('rappiWebSocketURL', this.serverUrl.getSocketURL());
    this.afterPlaceOrderEvent();
  },
  willRender() {
    this._super(...arguments);
    var session = this.get('session');
    if (session.get('isAuthenticated')) {
      let currentOrderId = this.get('currentOrderId');

      let accessToken = this.get('session').get('data.authenticated.access_token');

      const socket = this.get('socketIOService').socketFor(ENV.rappiWebSocketURL + accessToken);

      /*
       * All the event handlers are mapped here
       */

      socket.on('connect', this.onConnect, this);
      socket.on('disconnect', this.onDisConnect, this);

      if (currentOrderId) {
        socket.on('orders:' + currentOrderId + ':take', this.onOrderTaken, this);
        socket.on('orders:' + currentOrderId + ':update', this.onOrderUpdate, this);
        socket.on('orders:' + currentOrderId + ':closed', this.onOrderClose, this);
        socket.on('orders:' + currentOrderId + ':chat-message', this.onChatMessage, this);
      }
    }
  },
  onConnect(){
    console.info('successfully established a working connection ' + new Date());
  },
  afterPlaceOrderEvent() {

    var session = this.get('session');
    var currentOrderId = session.get('activeOrderIds')[0];
    this.set('currentOrderId', currentOrderId);
    console.log("session.get('isAuthenticated')>>", session.get('isAuthenticated'));
    if (session.get('isAuthenticated')) {
      this.set('orderObj', this.rappiOrder.getOrder('id', session.get('activeOrderIds')[0]));
      console.log("orderObj>>orderObj>>>", this.get('orderObj'));
      if (Ember.isPresent(this.get('orderObj')) && this.get('orderObj').get('state') === 'pending_review') {
        this.set('orderRatePanel', true);
        this.set('isOrderTaken', true);
      } else if (Ember.isPresent(this.get('orderObj')) && this.get('orderObj').get('state') === 'created') {
        this.set('isOrderCreated', true);
      } else if (Ember.isPresent(this.get('orderObj')) && this.get('orderObj').get('state') !== 'created') {
        this.set('isOrderTaken', true);
        this.set('isOrderCreated', false);
      }
    }
  },
  onDisConnect(data) {
    console.info('On DisConnect', data);
  }, onChatMessage(data) {
    let userId = this.get('session').get('currentUser').get('id');
    let receiverId = data.data.receiver_id;
    let senderId = data.data.sender_id;
    if (userId.toString() === receiverId.toString()) {
      this.rappiChat.pushReceivedMessage(data.data);
    } else if (userId.toString() === senderId.toString()) {
      this.rappiChat.pushSentMessage(data.data);
    }
  }, onOrderClose(data) {
    let userId = this.get('session').get('currentUser').get('id');
    if (userId.toString() === data.order.application_user_id.toString()) {
      this.alertNotification("Taken", "Your order successfully closed");
      this.rappiOrder.pushOrderFromEvent(data);
      this.set('orderRatePanel', true);
    }
  },
  onOrderTaken(data) {
    console.log("data>>", data);
    let userId = this.get('session').get('currentUser').get('id');
    if (userId.toString() === data.application_user_id.toString()) {
      this.rappiOrder.pushOrderFromEvent(data);
      if (Ember.isPresent(this.get('orderObj')) && this.get('orderObj').get('state') !== 'created') {
        this.set('isOrderTaken', true);
        this.set('isOrderCreated', false);
        this.alertNotification("Taken", "Your order successfully taken");

        /** Register event mix Panel */
        mixpanel.track("order_placed", {
          "payment_method": "",
          "amount_purchase": this.get('orderObj').get('total_charges'),
          "tip": this.get('orderObj').get('tip'),
          "coupon_amount": 0,
          "coupon_code": "",
          "number_of_products": 0,
          "number_of_SKUs": 0,
          "store_type": "express",
          "purchase_timestamp": new Date().getTime(),
          "product_purchased": [],
          "category": [],
          "sub_category": []
        });

      }
    }
  }, onOrderUpdate(data) {
    let userId = this.get('session').get('currentUser').get('id');
    if (data.user) {
      if (userId.toString() === data.user.id.toString()) {
        this.rappiOrder.pushOrderFromEvent(data);
        this.alertNotification("Taken", "Your order successfully updated");
        if (Ember.isPresent(this.get('orderObj')) && this.get('orderObj').get('state') !== 'created') {
          this.set('isOrderTaken', true);
          this.set('isOrderCreated', false);
        }
      }
    }
  },
  socketClosed(data) {
    console.info('On socketClosed', data);
  },
  willDestroyElement() {
    let currentOrderId = this.get('currentOrderId');
    let accessToken = this.get('session').get('data.authenticated.access_token');
    const socket = this.get('socketIOService').socketFor(ENV.rappiWebSocketURL + accessToken);

    socket.on('connect', this.socketClosed, this);
    socket.on('disconnect', this.socketClosed, this);
    socket.on('orders:' + currentOrderId + ':taken', this.socketClosed, this);
    socket.on('orders:' + currentOrderId + ':update', this.socketClosed, this);
    socket.on('orders:' + currentOrderId + ':closed', this.socketClosed, this);
    socket.on('orders:' + currentOrderId + ':chat_message', this.socketClosed, this);
    this.get('socketIOService').closeSocketFor(ENV.rappiWebSocketURL + accessToken);
  },
  alertNotification: function (purpose, message) {
    Ember.$("body").append('<div id="alert" style="display:none;width:240px;position: fixed;float: left;left: 15px;z-index: 999;bottom: 11px;"><div class="alert alert-success fade in"><strong>' + purpose + '!</strong>' + message + '</div></div>');
    Ember.$("#alert").fadeIn("slow")
    Ember.run.later(() => {
      Ember.$("#alert").fadeOut("slow");
    }, 5000);

    Ember.run.later(() => {
      Ember.$("#alert").remove();
    }, 5100);
  },
  actions: {
    cancelOrder: function () {
      this.set('closePopUp', false);
    }, closePopUp: function () {
      this.set('closePopUp', false);
    }, orderCancelRequest: function () {
      this.toggleProperty('isOrderCancelRequested');
    }, orderCancelled: function () {
      this.set('closePopUp', false);
    }, deActivateChat(){
      this.set('isOrderTaken', true);
      this.set('isOrderCreated', false);
      this.set('isChatOn', false);
    }, activateChat(){
      this.set('isOrderTaken', false);
      this.set('isOrderCreated', false);
      this.set('isChatOn', true);
      let userId = this.get('session').get('currentUser').get('id');
      let accessToken = this.get('session').get('data.authenticated.access_token');
      let orderId = this.get('session').get('activeOrderIds')[0];
      this.rappiChat.syncChatHistory(accessToken, orderId, userId, this.serverUrl.getUrl());
    }, showOrderPanel() {
      this.sendAction('showOrderPanel');
    },
    togglePopUp: function () {
      this.sendAction('togglePopUp');
    }
  }
});
