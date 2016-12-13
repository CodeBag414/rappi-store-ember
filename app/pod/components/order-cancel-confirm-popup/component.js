import Ember from 'ember';
import ENV from 'rappi/config/environment';

export default Ember.Component.extend({
  serverUrl: Ember.inject.service('server-url'),
  errMessage: '',
  flashMessages: Ember.inject.service(),
  confirmCancelRequestProcess: false,
  actions: {
    confirmCancelRequest: function () {
      let currentUrl = this.serverUrl.getUrl();
      let orderId = this.get('session').get('activeOrderIds')[0];
      if (Ember.isPresent(orderId)) {
        var accessToken = this.get('session').get('data.authenticated.access_token');
        let _this = this;
        this.set("confirmCancelRequestProcess", true);
        Ember.$.ajax({
          type: "PUT",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          dataType: 'json',
          url: `${currentUrl}${ENV.order}/${orderId}/cancel`,
          data: JSON.stringify({
            "rate": 5,
            "rate_reasons_ids": [],
            "comments": "Cancel for testing"
          })
        }).then(()=> {
          //refund in case of paypal
          if (_this.serverUrl.isPayPalENV()) {
            var order = this.cart.getCart(storeType).get("order");
            var comment = order.get("comment");
            let transactionNumber = comment.substring(7);
            var refundUrl = `${ENV.refundPaypal}`;
            var data ={
              transaction_number:transactionNumber
            };
            _this.apiService.post(refundUrl, data, null).then((rsp)=> {
              this.get('flashMessages').info("TRANSICIÓN éxito reembolso. Usted reembolsará ");
            }, (error)=> {
              this.get('flashMessages').info("reembolso no TRANSICIÓN");
            });
          }
          _this.rappiOrder.removeOrder(orderId);
          _this.set("closePopUp", false);
        }).fail((err)=> {
          this.set("errMessage", JSON.parse(err.responseText).error.message);
          _this.set("closePopUp", false);
          this.set("confirmCancelRequestProcess", false);
        });
      }
    },
    closePopup: function () {
      this.set("closePopUp", false);
    }
  }
});
