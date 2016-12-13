import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stLat,
  stLng,
  stStoreType
  } = ENV.storageKeys;

export default Ember.Component.extend({
  voucher: "",
  closeButton: true,
  loading: false,
  redeemCoupon: false,
  message: "",
  value: 0,
  init(){
    this._super(...arguments);
  },
  actions: {
    closeLoginPopup: function () {
      Ember.$('body').css('overflow', 'auto');
      this.set('showModalReg', false);
    },
    setVoucher: function(code) {
      if (code !== null && code.length > 0) {
        this.set('voucher', code);
      }
    },
    submit: function () {
      if (Ember.isBlank(this.get('voucher'))) {
        this.set('displayError', true);
        this.set('errorMessage', 'Ingrese el codigo del cupon');
      } else {
        this.set('loading', true);
        this.set('redeemCoupon', false);
        this.set('displayError', false);
        let code = this.get('voucher');
        let lat = this.storage.get(stLat);
        let lng = this.storage.get(stLng);
        let storeType = this.storage.get(stStoreType);
        let purchaseType = storeType === "super" ? "market" : "now";
        var accessToken = this.get('session').get('data.authenticated.access_token');
        this.serverUrl.redeemCoupon(code, lat, lng, storeType, purchaseType, accessToken, (resp)=> {
          this.set('loading', false);
          if (!resp.responseText) {
            this.set('redeemCoupon', true);
            this.set('message', resp.redeem_message);
            this.set('value', resp.offers.length >= 1 ? resp.offers[0].value : 0);
          } else {
            this.set('displayError', true);
            this.set('errorMessage', 'Código de cupón incorrecto');
          }
        });
      }
    }
  }
});
