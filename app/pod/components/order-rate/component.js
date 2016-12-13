import Ember from 'ember';
import ENV from 'rappi/config/environment';

export default Ember.Component.extend({
  serverUrl: Ember.inject.service('server-url'),
  rate: -1,
  sendProcess: false,
  storekeeper: {},
  orderId: null,
  init(){
    this._super(...arguments);
    let orderId = this.get('session').get('activeOrderIds')[0];
    this.set("orderId", orderId);
    let orderObj = this.rappiOrder.getOrder('id', orderId);
    if (Ember.isPresent(orderObj) && Ember.isPresent(orderObj.storekeeper)) {
      this.set('storekeeper', orderObj.storekeeper);
    }
  },
  actions: {
    rating: function (rateStage) {
      this.set("rate", rateStage);
      for (let i = 0; i < 5; i++) {
        if (i <= rateStage) {
          this.set(("stage" + i), true);
        } else {
          this.set(("stage" + i), false);
        }
      }
    },
    send: function (remember) {
      if (!remember) {
        this.set("rate", 4);
      }
      let message = this.get("message") === undefined ? '' : this.get("message");
      this.send("surveyCall", this.get("rate"), message);

    },
    surveyCall: function (rate, comments) {
      let currentUrl = this.serverUrl.getUrl();
      let orderId = this.get('orderId');
      if (Ember.isPresent(orderId)) {
        var accessToken = this.get('session').get('data.authenticated.access_token');
        this.set("sendProcess", true);
        Ember.$.ajax({
          type: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          dataType: 'json',
          url: `${currentUrl}${ENV.order}/${orderId}/survey`,
          data: JSON.stringify({
            "rate": (rate + 1),
            "rate_reasons_ids": [],
            "comments": comments
          })
        }).then(()=> {
          this.set("closePopUp", false);
          this.set("orderRatePanel", false);
          this.rappiOrder.removeOrder(orderId);
        }).fail(()=> {
          this.set("closePopUp", false);
          this.set("orderRatePanel", false);
        });
      }
    },
    closeModal: function () {
      this.set("closePopUp", false);
    }
  }
});
