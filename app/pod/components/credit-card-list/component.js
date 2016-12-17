import Ember from 'ember';
import ENV from 'rappi/config/environment';
const {
    stStoreType
    } = ENV.storageKeys;

export default Ember.Component.extend({
  serverUrl: Ember.inject.service('server-url'),
  session: Ember.inject.service('session'),
  flashMessages: Ember.inject.service(),
  creditcardInfo: null,
  creditcardDetails: null,
  openAddCCProcess: false,
  loadingCards: true,
  init(){
    this._super();
    var cardList = [];
    var accessToken = this.get('session').get('data.authenticated.access_token');
    let currentUrl = this.serverUrl.getUrl();
    var _this = this;
    this.apiService.get(`${currentUrl}${ENV.cardList}`, `${accessToken}`)
      .then((rsp)=> {
        this.set('user',this.get('session').get('currentUser').get("content"));
        let defaultCc = this.get('session').get('currentUser').get("content").get("default_cc");
        rsp.forEach((data)=> {
          data.isDefault = (data.card_reference === defaultCc) ? true : false;
          cardList.push(data);
        });
        this.set('loadingCards', false);
        this.set("creditcardDetails", cardList);
      }, (error)=> {
        console.log("err>> is ...", error);
        this.set('loadingCards', false);
      });

  },
  actions: {
    pay: function () {
        let _this = this;
      this.get('user').save().then(function(response){
        var tip = _this.get('tip');
        const orderInstruction = _this.get('orderInstruction');
        let currentUrl = _this.serverUrl.getUrl();
        let storeType = _this.storage.get(stStoreType);
        var order = _this.cart.getCart(storeType).get("order");
        Ember.set(order, 'payment', {"name": 'cc'});
        Ember.set(order, 'tip', parseInt(tip) || 0);
        let storedWhims = _this.cart.getWhim();
        if (Ember.isPresent(storedWhims) && Ember.isPresent(storedWhims.text)) {
          Ember.set(order, 'whim', storedWhims.text);
        }
        var accessToken = _this.get('session').get('data.authenticated.access_token');
        _this.set('isLoading', true);
        _this.apiService.post(`${currentUrl}${ENV.order}`, order, accessToken).then((resp)=> {
          _this.cart.clearCart(_this.storage.get(stStoreType));
          _this.get('session').set('activeOrderIds', [resp.id]);
          if (Ember.isPresent(orderInstruction)) {
            return _this.apiService.post(`${currentUrl}/${ENV.sendChatMessage}/${resp.id}`, {message: orderInstruction}, accessToken)
          }
        }).then(()=> {
          return _this.rappiOrder.syncOrder(accessToken, currentUrl);
        }).then(()=> {
          _this.set('isLoading', false);
          mixpanel.track("order_placed", {
            "payment_method": "credit_card",
            "amount_purchase": _this.get('placedOrder').get('total_charges'),
            "tip": _this.get('placedOrder').get('tip'),
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
          fbq("track", "Purchase", {
            value: "0",
            currency: "USD",
            content_ids: _this.get('session').get('activeOrderIds')[0]
          });
          _this.sendAction('orderPlaced', _this.get('session').get('activeOrderIds')[0]);
        }).catch((err)=> {

          _this.set('isLoading', false);
          let errMsg = `${err.statusText}: `;
          if (Ember.isPresent(err.responseJSON) && Ember.isPresent(err.responseJSON.errors)) {
            let errors = err.responseJSON.errors;
            Object.keys(errors).forEach((errKey)=> {
              errMsg += ', ' + errors[errKey][0];
            });
          }

          if (errMsg === "undefined: ") {
              _this.sendAction('orderPlaced', _this.get('session').get('activeOrderIds')[0]);
          } else {
              _this.get('flashMessages').danger(errMsg);
          }

        });
      }, function(error){
        _this.get('flashMessages').danger(error);
      });
    }, openAddCC: function () {
      var session = this.get('session');
      if (session.isAuthenticated) {
        var accessToken = session.get('data.authenticated.access_token');
        let currentUrl = this.serverUrl.getUrl();
        this.set("openAddCCProcess", true);
        this.set('isLoading', true);
        this.apiService.get(`${currentUrl}${ENV.addCreditCardUrl}?env=pro`, `${accessToken}`).then((rsp)=> {
          var redirectUrl = rsp.url;
          this.set("openAddCCProcess", false);
          this.set("redirectURL", redirectUrl);
          this.sendAction('showAddCC', redirectUrl);
        }).catch((err)=> {
          this.set("openAddCCProcess", false);
          this.set('isLoading', false);
          console.log("err>> is ...", err);
        });
      } else {
        this.transitionToRoute('index');
      }
    }, selectCC(selectedCC){
      console.log('selectedCC', selectedCC);
      this.get('creditcardDetails').forEach((creditCard)=>{
        Ember.$('#'+creditCard.bin).prop('checked', false);
      });
      Ember.$('#'+selectedCC.bin).prop('checked', true);
      this.set('selectedCC',selectedCC);
      var currentUser = this.get('user');
      currentUser.default_cc = selectedCC.card_reference;
    }, closeCCPopoup(){
      this.sendAction('showCreditCardList');
    }
  }
});
