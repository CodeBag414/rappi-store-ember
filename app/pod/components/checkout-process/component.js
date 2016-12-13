import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stContent
  } = ENV.storageKeys;

export default Ember.Component.extend({
  showModalDelevery: false,//this has been set to true to skip the address list popup in checkout flow for now
  showAddAddress: false,
  orderStatusModal: false,
  orderId: null,
  isOrderPlaced: false,
  showCreditCardList: false,
  tipForOrder: null,
  showAddCC: false,
  CCURL: null,
  isLoading: false,
  flashMessages: Ember.inject.service(),
  session: Ember.inject.service('session'),
  store: Ember.inject.service(),
  init(){
    this._super(...arguments);
    const content = this.storage.get(stContent);
    this.set('phonePrefix', content.phone_prefix);
    this.set('countryName', content.countryName);
    this.set('showModalDelevery', false);
    if (this.get('phoneVerification')) {
      this.verifyPhone();
    } else if (!this.get('showAddressListWhenCheckout')) {
      if (!this.get('phoneVerification')) {
        this.set('showModalDelevery', true);
      }
    }
  },
  didUpdateAttrs() {
    this._super(...arguments);
    if (this.get('showModalDelevery') === 'showModalDelevery') {
      this.set('showModalDelevery', false);
    }
    if (this.get('phoneVerification')) {
      this.verifyPhone();
    }
  },
  verifyPhone(){
    if (typeof window.AccountKit === 'undefined') {
      this.sendAction('resetPhoneVerification');
      this.get('flashMessages').info('Algo salió mal. Por favor, intente después de algún tiempo.');
      return;
    }
    const accessToken = this.get('session').get('data.authenticated.access_token');
    const phonePrefix = this.get('phonePrefix');
    let self = this;
    this.set('isLoading', true);
    this.set('phoneVerification', false);
    AccountKit.login('PHONE', {countryCode: phonePrefix, phoneNumber: ''}, function (response) {
      if (response.status === "PARTIALLY_AUTHENTICATED" && accessToken === response.state) {
        var app_access_token = ['AA', ENV.accountKitAppID, ENV.accountKitAppSecret].join('|');
        var token_exchange_url = `${ENV.accountKitAccessTokenURL}code=${response.code}&access_token=${app_access_token}`;
        self.apiService.get(token_exchange_url).then((response)=> {
          var me_endpoint_url = `${ENV.accountKitMeURL}access_token=${response.access_token}`;
          return self.apiService.get(me_endpoint_url);
        }).then((response)=> {
          const verifiedCountryPrefix = response.phone.country_prefix;
          if (`+${verifiedCountryPrefix}` !== phonePrefix) {
            self.set('isLoading', false);
            self.set('showPopUp', false);
            self.get('flashMessages').info(`Se le permite verificar sólo el número de teléfono de ${self.get('countryName')}.`);
            return;
          }
          let store = self.get('store');
          store.findAll('user').then((users) => {
            users.forEach((user)=> {
              user.set('phone', response.phone.national_number);
              user.save().then(()=> {
                self.set('isLoading', false);
              }).catch((err)=> {
                self.set('isLoading', false);
                self.set('showPopUp', false);
                self.get('flashMessages').danger("Algo salió mal.");
              });
            });
          });
        }).catch((err)=> {
          console.log("err bahar>>>", err);
          self.set('isLoading', false);
          self.set('showPopUp', false);
          self.get('flashMessages').danger("Algo salió mal.");
        })
      }
      else if (response.status === "NOT_AUTHENTICATED") {
        // handle authentication failure
        self.set('isLoading', false);
        self.set('showPopUp', false);
        self.get('flashMessages').danger("NOT_AUTHENTICATED");
      }
      else if (response.status === "BAD_PARAMS") {
        // handle bad parameters
        self.set('isLoading', false);
        self.set('showPopUp', false);
        self.get('flashMessages').danger("BAD_PARAMS");
      }
    });
  },
  actions: {
    showModalDelevery: function () {
      this.set("showModalDelevery", true);
    },
    orderPlaced: function (orderId) {
      this.set('orderId', orderId);
      this.set("showModalDelevery", false);
      this.set("isOrderPlaced", true);
      this.set("showCreditCardList", false);
      this.sendAction('setCartRemoved');
    },
    verifyPhone(phoneNumber){
      this.set("phoneNumber", phoneNumber);
      this.set("showModalDelevery", false);
      this.set("phoneVerification", false);
      this.set("showPhoneNumberVerifyModel", true);
    },
    orderStatus: function () {
      this.set('orderStatusModal', true);
    },
    showAddAddress: function () {
      this.set('showAddAddress', true);

    }, showCreditCardList: function (tip) {
      this.set('tipForOrder', tip);
      this.set("showModalDelevery", false);
      this.set('showCreditCardList', true);
    }, showAddCC: function (redirectUrl) {
      this.set('CCURL', redirectUrl);
      this.toggleProperty('showAddCC');
    }, orderCancelled: function () {
      this.set('showPopUp', false);
      this.set('orderStatusModal', false);
      this.set('showModalDelevery', false);
      this.set('showAddAddress', false);
    },
    closeCancelOrderPopup: function () {
      this.set("showAddAddress", false);
      this.set("showPopUp", false);
    },
    togglePopUp: function () {
      this.sendAction('togglePopUp');
    }, iFrameLoaded(){
      this.set('isLoading', false);
    }
  }
});
