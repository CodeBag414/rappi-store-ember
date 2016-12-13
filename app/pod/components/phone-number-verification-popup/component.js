import Ember from 'ember';
import ENV from 'rappi/config/environment';

const { stContent }= ENV.storageKeys;

export default Ember.Component.extend({
  serverUrl: Ember.inject.service('server-url'),
  store: Ember.inject.service(),
  phoneVerifyProcess: false,
  init(){
    this._super(...arguments);
    console.log("agya haramkhor");
    this.set('phonePrefix', this.storage.get(stContent).phone_prefix);
  },
  actions: {
    onKeyPressOne: function () {
      this.set("error", false);
      Ember.$("#two").focus();
    },
    onKeyPressTwo: function () {
      this.set("error", false);
      Ember.$("#three").focus();
    },
    onKeyPressThree: function () {
      this.set("error", false);
      Ember.$("#four").focus();
    },
    onKeyPressFour: function () {
    },
    submit: function () {
      let ver0 = this.get("very0");
      let ver1 = this.get("very1");
      let ver2 = this.get("very2");
      let ver3 = this.get("very3");
      let currentUrl = this.serverUrl.getUrl();
      let data = {
        global_number: `${this.get("phonePrefix")}${this.get("phoneNumber")}`,
        code: ver0 + ver1 + ver2 + ver3
      };

      this.set("phoneVerifyProcess", true);
      var accessToken = this.get('session').get('data.authenticated.access_token');
      this.apiService.post(`${currentUrl}${ENV.updatePhone}`, data, accessToken)
        .then(()=> {
          this.set("showPhoneNumberVerifyModel", false);
          this.set("showModalDelevery", true);
          this.set("phoneVerifyProcess", false);
          this.get('store').findAll('user').reload();
        }, (error)=> {
          let message = JSON.parse(error.responseText).errors.codigo_sms[0];
          this.set("error_message", message);
          this.set("error", true);
          this.set("phoneVerifyProcess", false);
        });
    }
  }
});
