import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stContent
  } = ENV.storageKeys;

export default Ember.Component.extend({
  serverUrl: Ember.inject.service('server-url'),
  registerPhoneProcess: false,
  init(){
    this._super(...arguments);
    const content = this.storage.get(stContent);
    this.set('phonePrefix', content.phone_prefix);
    this.set('countryName', content.countryName);
    this.set('countryFlag', content.code.toLowerCase() === 'co' ? 'ico_flag_colombia.svg' : 'ico_flag_mexico.svg');
  },
  actions: {
    onKeyPress: function () {
      this.set('invalidPhone', false);
    },
    submit: function () {
      var phone = this.get('phone');
      let showError = true;
      let isValid = true;
      if (Ember.isBlank(phone)) {
        this.set('invalidPhone', true);
        this.set('phoneMessage', 'Por favor , rellene el número de teléfono .');
        this.set('color', 'spanColor');
        isValid = false;
        showError = false;
      }

      if ((isNaN(phone) || phone === undefined) && showError) {
        this.set('invalidPhone', true);
        this.set('phoneMessage', 'número de teléfono debe ser un número.');
        this.set('color', 'spanColor');
        isValid = false;
        showError = false;
      }

      if (isValid) {
        const phonePrefix = this.get('phonePrefix');
        let currentUrl = this.serverUrl.getUrl();
        //this.sendAction('verifyPhone', phone);
        //return;
        this.set("registerPhoneProcess", true);
        this.apiService.post(`${currentUrl}${ENV.sendCode}`, {number: `${phonePrefix}${phone}`})
          .then((resp)=> {
            let response = typeof resp === "string" ? JSON.parse(resp) : resp;
            if (response.status === "Error") {
              this.set("registerPhoneProcess", false);
              this.set('invalidPhone', true);
              this.set('phoneMessage', response.message);
              this.set('color', 'spanColor');
            }
            this.sendAction('verifyPhone', phone);
            this.set("registerPhoneProcess", false);
          }).catch((err)=> {
            this.set("registerPhoneProcess", false);
            this.set('invalidPhone', true);
            this.set('phoneMessage', 'Algo salió mal.');
            this.set('color', 'spanColor');
          })
      }
    }
  }
});
