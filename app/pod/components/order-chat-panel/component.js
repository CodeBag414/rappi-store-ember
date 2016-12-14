import Ember from 'ember';
import ENV from 'rappi/config/environment';

export default Ember.Component.extend({
  chatArray: [],
  isLoading: true,
  storekeeper: {},
  currentUser: null,
  sendMessageProcess: false,
  sendMediaMessageProcess: false,
  didRender() {
    this._super(...arguments);
    var _this = this;
    if (!this.get("eventAddedToTextArea")) {
      this.set("eventAddedToTextArea",true);
      $('#chattextarea').on('keydown', function (e) {
        if (e.which == 13) {
          e.preventDefault();
          _this.send("sendMessage");
        }
      }).on('input', function () {
        _this.setHeightOfChatText();
      });
    }
  },
  setHeightOfChatText(){
    $("#chattextarea").height(1);
    var totalHeight = $("#chattextarea").prop('scrollHeight') - parseInt($("#chattextarea").css('padding-top')) - parseInt($("#chattextarea").css('padding-bottom'));
    $("#chattextarea").height(totalHeight);
  }, init() {
    this._super(...arguments);
    let orderId = this.get('session').get('activeOrderIds')[0];
    this.set("currentUser", this.get('session').get('currentUser'));
    this.set("orderId", orderId);
    this.set('chatArray', []);
    let _this = this;
    let parentView = this.get('parentView');
    let orderObj = this.rappiOrder.getOrder('id', orderId);
    if (Ember.isPresent(orderObj) && Ember.isPresent(orderObj.storekeeper)) {
      this.set('storekeeper', orderObj.storekeeper);
    }

    this.rappiChat.on('messageReceived', function (chatObj) {
      let chatArray = _this.get('chatArray');
      chatArray.pushObject(chatObj);
      Ember.run.later(this, ()=> {
        Ember.$("#chatBox").animate({scrollTop: Ember.$("#chatBox").prop('scrollHeight')}, "slow");
      }, 200);
    });

    this.rappiChat.on('chatHistoryLoaded', function () {
      let chatArray = [];
      _this.rappiChat.getChat().forEach((chatObj)=> {
        chatArray.pushObject(chatObj);
      });
      _this.set('chatArray', chatArray);
      _this.set('isLoading', false);
      Ember.run.later(this, ()=> {
        Ember.$(".ember-modal-dialog").css({top: '30px'});
        Ember.$("#chatBox").animate({scrollTop: Ember.$("#chatBox").prop('scrollHeight')}, "slow");
      }, 1000);
    });
    this.refreshChatMessages();
  },
  willDestroyElement() {
    this.rappiChat.off('messageReceived');
    this.rappiChat.off('chatHistoryLoaded');
    Ember.run.cancel(this.get("messageRefresher"));
  },
  actions: {
    sendMessage() {
      let orderId = this.get('orderId');
      let message = this.get('message');
      if (Ember.isPresent(orderId) && Ember.isPresent(message) && message.trim().length > 0) {
        var accessToken = this.get('session').get('data.authenticated.access_token');
        this.set('message', '');
        Ember.run.later(this,this.setHeightOfChatText,100);
        this.set('isLoading', true);
        let currentUrl = this.serverUrl.getUrl();
        let _this = this;
        this.set("sendMessageProcess", true);
        Ember.$.ajax({
          type: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          dataType: 'json',
          url: `${currentUrl}/${ENV.sendChatMessage}/${orderId}`,
          data: JSON.stringify({message})
        }).then(()=> {
          if (_this.serverUrl.isPayPalENV()) {
            mixpanel.track("paypal_sent_chat_message");
          } else {
            mixpanel.track("sent_chat_message");
          }
          this.set("sendMessageProcess", false);
          this.set('isLoading', false);
        }).fail((err)=> {
          this.set("sendMessageProcess", false);
          this.set('isLoading', false);
          console.log("err>", JSON.parse(err.responseText).error.message);
        });
      }
    },
    deActivateChat() {
      this.sendAction('deActivateChat');
    },
    sendMediaMessage(thisComponent, event) {
      let orderId = this.get('orderId');
      var file = event.target.files[0];
      var data = new FormData();
      data.append('image', file);
      var _this= this;
      if (Ember.isPresent(orderId) && Ember.isPresent(file)) {
        var accessToken = this.get('session').get('data.authenticated.access_token');
        this.set("sendMediaMessageProcess", true);
        this.set('isLoading', true);
        Ember.$.ajax({
          type: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`
          },
          url: `${ENV.rappiServerURL}/${ENV.sendChatMessage}/${orderId}`,
          data: data,
          cache: false,
          contentType: false,
          processData: false
        }).then((resp)=> {
          console.log("resp>>", resp);
          if (_this.serverUrl.isPayPalENV()) {
            mixpanel.track("paypal_sent_chat_message");
          } else {
            mixpanel.track("sent_chat_message");
          }
          this.set("sendMediaMessageProcess", false);
          this.set('isLoading', false);
        }).fail((err)=> {
          this.set("sendMediaMessageProcess", false);
          this.set('isLoading', false);
          console.log("err>", JSON.parse(err.responseText).error.message);
        });
      }
    }
  },
  refreshChatMessages() {
    let refresher = Ember.run.later(this, function () {
      let userId = this.get('session').get('currentUser').get('id');
      let accessToken = this.get('session').get('data.authenticated.access_token');
      let orderId = this.get('session').get('activeOrderIds')[0];
      this.rappiChat.syncChatHistory(accessToken, orderId, userId, this.serverUrl.getUrl());
      this.refreshChatMessages();
    }.bind(this), 5000);
    Ember.set(this,"messageRefresher",refresher);
  }

});
