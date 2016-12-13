import Ember from 'ember';
import ENV from 'rappi/config/environment';
const {
  stStoreType,
  paypal
  } = ENV.storageKeys;

export default Ember.Component.extend({
  serverUrl: Ember.inject.service('server-url'),
  flashMessages: Ember.inject.service(),
  showDelevry: false,
  tip: 0,
  showTime: false,
  isOtherSelectd: false,
  tipValues: [],
  errorMessage: '',
  paypalProcess: false,
  creditProcess: false,
  disablePaypal: false,
  isTabIdUsed:false,
  init() {
    this._super(...arguments);
    let tipss = this.serverUrl.getDataByCountry()['tip_values'].split(',');
    this.set('tipValues', {"one": tipss[0], "two": tipss[1]});
    this.set("tip", tipss[0]);
    if(!this.storage.get(paypal)){
      this.set("isTabIdUsed",true);
    }
  },
  willRender() {
    this._super(...arguments);
    if (this.storage.get(stStoreType) === "super") {
      this.set('showTime', true);
    }
  },
  actions: {
    swapPanel: function () {
      this.toggleProperty('showDelevry');
    },
    closeDeliveryPopup: function () {
      this.set('showModalDelevery', false);
      this.set('removeAddressList', false);
    },
    creditCard: function (paymentType) {
      let tip = this.get('tip');
      this.set('showErrorMessage', false);
      if (Ember.isEmpty(tip) || isNaN(tip) || parseInt(tip) < 0) {
        this.set('creditProcess', false);
        this.set('showErrorMessage', true);
        return;
      }
      if (paymentType === 'cc') {
        mixpanel.track("tarjeta_de_credito");
        this.sendAction('showCreditCardList', tip);
      } else if (paymentType === 'cash') {
        mixpanel.track("effectivo");
        let currentUrl = this.serverUrl.getUrl();
        let storeType = this.storage.get(stStoreType);
        var order = this.cart.getCart(storeType).get("order");
        Ember.set(order, 'payment', {"name": paymentType});
        Ember.set(order, 'tip', parseInt(tip) || 0);
        let storedWhims = this.cart.getWhim();
        if (Ember.isPresent(storedWhims) && Ember.isPresent(storedWhims.text)) {
          Ember.set(order, 'whim', storedWhims.text);
        }
        var accessToken = this.get('session').get('data.authenticated.access_token');
        this.set('creditProcess', true);
        this.set('isLoading', true);
        this.apiService.post(`${currentUrl}${ENV.order}`, order, accessToken).then((resp)=> {
          this.cart.clearCart(this.storage.get(stStoreType));
          this.get('session').set('activeOrderIds', [resp.id]);
          return this.rappiOrder.syncOrder(accessToken, currentUrl);
        }).then(()=> {
          if (paymentType === 'cash') {
            mixpanel.track("order_placed");
            fbq("track","Purchase",{value:"0",currency:"USD",content_ids:this.get('session').get('activeOrderIds')[0]});
            this.sendAction('orderPlaced', this.get('session').get('activeOrderIds')[0]);
          } else if (paymentType === 'cc') {
            console.log("cc");
          }
          this.set('isLoading', false);
        }).catch((err)=> {
          let errMsg = `${err.statusText}: `;
          if (Ember.isPresent(err.responseJSON) && Ember.isPresent(err.responseJSON.errors)) {
            let errors = err.responseJSON.errors;
            Object.keys(errors).forEach((errKey)=> {
              errMsg += ', ' + errors[errKey][0];
            })
          }
          this.get('flashMessages').danger(errMsg);
          this.set('creditProcess', false);
          this.set('isLoading', false);
        });
      }

    },
    setTip: function (tipName, name) {
      if (name === "otro") {
        this.set('isOtherSelectd', true);
        this.set("tip", null);
      } else {
        this.set('isOtherSelectd', false);
        this.set("tip", tipName);
      }
      this.$(".tags ul li .active").removeClass();
      this.$('#' + name).addClass("active");
    },
    payPal: function () {
      this.set("disablePaypal", true);
      let tip = this.get('tip');
      let paymentType = "cash";
      let currentUrl = this.serverUrl.getUrl();
      var accessToken = this.get('session').get('data.authenticated.access_token');
      if (Ember.isEmpty(tip) || isNaN(tip) || parseInt(tip) < 0) {
        this.set('showErrorMessage', true);
        return;
      }

      let storeType = this.storage.get(stStoreType);
      var cart = this.cart.getCart(storeType);
      let cartItems = cart.get('cartItems');
      let items = [];
      cartItems.forEach((item)=> {
        items.push({name: item.name, quantity: item.quantity, unitPrice: parseInt(item.unitPrice)});
      });
      if (Ember.isPresent(cart.get('shippingCharges'))) {
        items.push({name: "Shipping Charges", quantity: 1, unitPrice: cart.get('shippingCharges')});
      }
      if (Ember.isPresent(tip) && !isNaN(tip) && parseInt(tip) > 0) {
        items.push({name: "Tip", quantity: 1, unitPrice: parseInt(tip)});
      }
      var currentUser = this.get('session').get('currentUser');
      var fullName = currentUser.get("first_name") + currentUser.get("last_name");
      let storeType1 = this.storage.get(stStoreType);
      var address = this.cart.getCart(storeType1).get("order").get("address").get("address");
      let data = {
        "paymentType": "tab",
        "tabId": this.storage.get(paypal) ? this.storage.get(paypal).paypal_tab_id : null,
        "invoice": {
          "merchantEmail": "juan@rappi.com",
          "partnerReferrerCode": "rappi_Cart",
          "merchantInfo": {
            "businessName": "Tecnologias Rappi SAPI de CV",
            "address": {
              "line1": "Belgrado 17",
              "city": "Mexico City",
              "state": "DF",
              "postalCode": "06600",
              "country": "MX"
            },
            "phoneNumber": "6142478060"
          },
          "currencyCode": "MXN",
          "items": items,
          "invoiceDate": new Date(),
          "paymentTerms": "DueOnReceipt",
          "deliveryAddress": {
            "addresseeName": fullName,
            "address": {
              "line1": address,
              "city": address,
              "state": "Mexico",
              "postal_code": "11111",
              "country_code": "52"
            }
          }
        }
      };
      let url = `${ENV.payPaypal}`;
      this.set('paypalProcess', true);
      this.set('isLoading', true);
      this.set("errorStatus", "Paypal payment error : ");
      return this.apiService.post(url, data, null).then((rsp)=> {
        this.storage.set(paypal,null);
        if (rsp.error !== undefined) {
          this.get('flashMessages').danger(rsp.error);
          this.set('paypalProcess', false);
          return;
        }
        this.set("errorStatus", "algo salió mal : ");
        let storeType = this.storage.get(stStoreType);
        var order = this.cart.getCart(storeType).get("order");
        Ember.set(order, 'payment', {"name": paymentType});
        Ember.set(order, 'tip', parseInt(tip) || 0);
        Ember.set(order, 'comment', 'paypal ' + rsp.transactionNumber);
        this.set("transactionNumber", rsp.transactionNumber);
        let storedWhims = this.cart.getWhim();
        if (Ember.isPresent(storedWhims) && Ember.isPresent(storedWhims.text)) {
          Ember.set(order, 'whim', storedWhims.text);
        }
        this.set("errorStatus", "Orden error: ");
        return this.apiService.post(`${currentUrl}${ENV.order}`, order, accessToken);
      }).then((resp)=> {
        this.cart.clearCart(this.storage.get(stStoreType));
        this.get('session').set('activeOrderIds', [resp.id]);
        return this.rappiOrder.syncOrder(accessToken, currentUrl);
      }).then(()=> {
        this.set('isLoading', false);
        mixpanel.track("order_placed");
        fbq("track","Purchase",{value:"0",currency:"USD",content_ids:this.get('session').get('activeOrderIds')[0]});
        this.sendAction('orderPlaced', this.get('session').get('activeOrderIds')[0]);
      }).catch((err)=> {
        this.storage.set(paypal,null);
        let errMsg = `${err.statusText}: `;
        var error = err.responseText ? JSON.parse(err.responseText) : err;
        this.get('flashMessages').info(this.get("errorStatus") + (error.error ? error.error : error) + " Por favor, esperamos que estamos devolvemos su dinero", {
          timeout: 5000
        });
        if (this.get("transactionNumber")) {
          var refundUrl = `${ENV.refundPaypal}`;
          let transactionNumber = this.get("transactionNumber");
          this.set("transactionNumber", null);
          var data = {
            transaction_number: transactionNumber
          };
          this.apiService.post(refundUrl, data, null).then((rsp)=> {
            this.get('flashMessages').info("TRANSICIÓN éxito reembolso. Usted reembolsará ");
          }, (error)=> {
            this.get('flashMessages').info("reembolso no TRANSICIÓN");
          });
        }
        this.set('paypalProcess', false);
        this.set('isLoading', false);
        console.log("err>>>", err);
      });
    }
  }
});
