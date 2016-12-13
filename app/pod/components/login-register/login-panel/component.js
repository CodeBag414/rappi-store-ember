import Ember from 'ember';
import ENV from 'rappi/config/environment';
const {
  paypal
  } = ENV.storageKeys;

export default Ember.Component.extend({
  serverUrl: Ember.inject.service('server-url'),
  cart: Ember.inject.service('cart'),
  locations: ENV.location,
  locationIndex: -1,
  authProcess: false,
  passwordInput: {
    src: "/assets/images/ojo-cerrado.svg",
    type: "password",
    visible: false
  },
  actions: {
    setPasswordVisible: function () {
      Ember.set(this.passwordInput, "visible", !this.passwordInput.visible);
      Ember.set(this.passwordInput, "src", this.passwordInput.visible ? "/assets/images/ojo-abierto.svg" : "/assets/images/ojo-cerrado.svg");
      Ember.set(this.passwordInput, "type", this.passwordInput.visible ? "text" : "password");
    },
    selectLocation: function (value) {
      if (value === "") {
        return;
      }
      let location = this.locations[value][this.locations[value].name];
      this.set("location", location);
      this.set("locationIndex", value);
    },
    onKeyPress: function () {
      this.set('invalidEmail', false);
      this.set('invalidPassword', false);
      this.set('loginUnsuccess', false);
    },
    authenticate() {
      var isValid = true;
      var showError = true;
      let { email, password } = this.getProperties('email', 'password');

      if (Ember.isBlank(email)) {
        this.set('invalidEmail', true);
        this.set('emailMessage', 'Por favor , rellene un correo electrónico válido');
        this.set('color', 'spanColor');
        isValid = false;
        showError = false;
      }

      if (!validateEmail(email) && showError) {
        this.set('invalidEmail', true);
        this.set('emailMessage', 'Por favor , rellene correo electrónico válida.');
        this.set('color', 'spanColor');
        isValid = false;
        showError = false;
      }

      if (Ember.isBlank(password) && showError) {
        this.set('invalidPassword', true);
        this.set('passwordMessage', 'Por favor , rellene la contraseña .');
        this.set('color', 'spanColor');
        isValid = false;
        showError = false;
      }

      if (isValid) {
        this.send("authorize", email, password);
      }

      function validateEmail(emailid) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(emailid);
      }
    },
    authorize: function (email, password) {
      Ember.$('body').css('overflow', 'auto');
      let currentUrl = this.serverUrl.getUrl();
      if (this.storage.get(paypal) !== undefined) {
        this.set("params", this.storage.get(paypal));
      }
      this.send('setSession', email, password, currentUrl, this.get("params"));
    },
    setSession: function (email, password, currentUrl, data) {
      this.set('authProcess', true);
      if (data === undefined) {
        return this.get('session').authenticate('authenticator:rappi', email, password, currentUrl).then(()=> {
          fbq("trackCustom","Login",{email:email});
          mixpanel.track("login");
          this.send("setDataAfterAuthorize");
        }).catch((reason) => {
          this.send("handleCatchOfAuthorize", reason);
          this.set('authProcess', false);
        });
      } else {
        return this.get('session').authenticate('authenticator:paypal-authenticator', {
          username: email,
          password,
          "scope": "all",
          "paypal_customer_id": data.paypal_customer_id,
          "paypal_tab_id": data.paypal_tab_id,
          "paypal_location_id": data.paypal_location_id
        }, currentUrl).then(()=> {
          fbq("trackCustom","LoginPaypal",{paypal_customer_id:data.paypal_customer_id});
          mixpanel.track("login");
          this.send("setDataAfterAuthorize");
        }).catch((reason) => {
          this.send("handleCatchOfAuthorize", reason);
          this.set('authProcess', false);
        });
      }
    },
    handleCatchOfAuthorize: function (reason) {
      this.set('errorMessage', reason.error || reason);
      this.set('loginUnsuccess', true);
      this.set('loginUnsuccessMessage', 'Lo sentimos nombre de usuario o contraseña incorrecta !');
      this.set('color', 'spanColor');
    },
    setDataAfterAuthorize: function () {
      Ember.run.later(this, ()=> {
        let addresses = this.get('session').get('currentAddress');
        if (this.get('session').get('currentUser').get("name") === undefined || Array.isArray(addresses)) {
          this.send('setDataAfterAuthorize');
        } else {
          this.userService.setDataAfterAuthorize(this, addresses);
        }

        if (this.get('session').get('currentUser').get("name")) {
          //When log in
          mixpanel.track("login",{
          	"method": this.get('session').get('currentUser').get("email"),
            "age": this.get('session').get('currentUser').get("age"),
            "gender": this.get('session').get('currentUser').get("gender"),
            "name": this.get('session').get('currentUser').get("name")
          });
        }
      }, 500);
    },
    recoverPassword(){
      this.set("showRecoverPassword",true);
    }
  }
});
