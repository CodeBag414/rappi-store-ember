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

    this.apiService.get(`${currentUrl}${ENV.cardList}`, `${accessToken}`)
      .then((rsp)=> {
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
    selectCC: function (selectedCC) {
      var tip = this.get('tip');
      let currentUrl = this.serverUrl.getUrl();
      let storeType = this.storage.get(stStoreType);
      var order = this.cart.getCart(storeType).get("order");
      Ember.set(order, 'payment', {"name": 'cc'});
      Ember.set(order, 'tip', parseInt(tip) || 0);
      let storedWhims = this.cart.getWhim();
      if (Ember.isPresent(storedWhims) && Ember.isPresent(storedWhims.text)) {
        Ember.set(order, 'whim', storedWhims.text);
      }
      var accessToken = this.get('session').get('data.authenticated.access_token');
      this.set('isLoading', true);
      this.apiService.post(`${currentUrl}${ENV.order}`, order, accessToken).then((resp)=> {
        this.cart.clearCart(this.storage.get(stStoreType));
        this.get('session').set('activeOrderIds', [resp.id]);
        return this.rappiOrder.syncOrder(accessToken, currentUrl);
      }).then(()=> {
        this.set('isLoading', false);
        mixpanel.track("order_placed");
        fbq("track","Purchase",{value:"0",currency:"USD",content_ids:this.get('session').get('activeOrderIds')[0]});
        this.sendAction('orderPlaced', this.get('session').get('activeOrderIds')[0]);
      }).catch((err)=> {
        this.set('isLoading', false);
        let errMsg = `${err.statusText}: `;
        if (Ember.isPresent(err.responseJSON) && Ember.isPresent(err.responseJSON.errors)) {
          let errors = err.responseJSON.errors;
          Object.keys(errors).forEach((errKey)=> {
            errMsg += ', ' + errors[errKey][0];
          })
        }
        this.get('flashMessages').danger(errMsg);
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
    }
  }
});
