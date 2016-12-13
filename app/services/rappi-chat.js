import Ember from 'ember';
import ChatMessageModel from '../models/chat-message';
import ENV from 'rappi/config/environment';
const {
  ArrayProxy,
  computed,
  } = Ember;
const get = Ember.get;

export default ArrayProxy.extend(Ember.Evented, {
  isServiceFactory: true,

  pushSentMessage(data) {
    let chatObj = ChatMessageModel.create(data);
    if (Ember.isEmpty(this.findBy('id', get(chatObj, 'id')))) {
      this.pushObject(chatObj);
      this.trigger('messageReceived', chatObj);
    }
  },
  pushReceivedMessage(data) {
    let chatObj = ChatMessageModel.create(data);
    if (Ember.isEmpty(this.findBy('id', get(chatObj, 'id')))) {
      chatObj.messageReceived();
      this.pushObject(chatObj);
      this.trigger('messageReceived', chatObj);
    }
  },
  getChat() {
    return this;
  },
  pushChat(chatObj, userId) {
    let receiverId = chatObj.receiver_id;
    chatObj = ChatMessageModel.create(chatObj);
    if (Ember.isEmpty(this.findBy('id', get(chatObj, 'id')))) {
      if (userId.toString() === receiverId.toString()) {
        chatObj.messageReceived();
      }
      this.pushObject(chatObj);
    }
  },
  syncChatHistory(accessToken, orderId, userId,currentUrl) {
    let _this = this;
    return Ember.$.ajax({
      type: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      dataType: 'json',
      url: `${currentUrl}/${ENV.chatHistory}/${orderId}`,
    }).then((chatData)=> {
      if (Ember.isPresent(chatData)) {
        chatData.reverse();
        chatData.forEach(function (chatObj) {
          _this.pushChat(chatObj, userId);
        });
      }
      _this.trigger('chatHistoryLoaded');
    });
  },
  isEmpty: computed.empty('content'),
  isNotEmpty: computed.not('isEmpty'),
  counter: computed.alias('length')
});
