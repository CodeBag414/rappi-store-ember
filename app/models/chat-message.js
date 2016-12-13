import Ember from 'ember';

export default Ember.Object.extend({
  id: null,
  alert: "",
  image: null,
  channel: "",
  created_at: "",
  order_id: null,
  receiver_id: null,
  sender_id: null,
  title: "",
  updated_at: "",
  isSent: true,
  isLast: false,
  messageReceived(){
    this.set('isSent', false);
    return this;
  }
});
