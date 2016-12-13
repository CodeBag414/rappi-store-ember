import Ember from 'ember';
import ENV from 'rappi/config/environment';
const {
  paypal
  } = ENV.storageKeys;

export default Ember.Component.extend({
  serverUrl: Ember.inject.service('server-url'),
  invalidEmail: false,
  invalidPassword: false,
  invalidConfirmPassword: false,
  invalidFirstName: false,
  invalidLastName: false,
  invalidPhone: false,
  acceptTerms: false,
  authProcess: false,
  passwordInput: {
    src: "/assets/images/ojo-cerrado.svg",
    type: "password",
    visible: false
  },
  actions: {
    showDialog: function () {
      this.toggleProperty('showModalTC');
    },
    setPasswordVisible: function () {
      Ember.set(this.passwordInput, "visible", !this.passwordInput.visible);
      Ember.set(this.passwordInput, "src", this.passwordInput.visible ? "/assets/images/ojo-abierto.svg" : "/assets/images/ojo-cerrado.svg");
      Ember.set(this.passwordInput, "type", this.passwordInput.visible ? "text" : "password");
    },
    onKeyPress: function () {
      this.set('invalidEmail', false);
      this.set('invalidPassword', false);
      this.set('invalidConfirmPassword', false);
      this.set('invalidFirstName', false);
      this.set('invalidLastName', false);
      this.set('invalidPhone', false);
      this.set('registrationFailed', false);
    },
    submit: function () {
      var email = this.get('email');
      var password = this.get('password');
      var firstName = this.get('firstName');
      var lastName = this.get('lastName');
      var phone = this.get('phone');
      var isValid = true;
      var showError = true;

      function validateEmail(emailid) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(emailid);
      }

      if (Ember.isBlank(email)) {
        this.set('invalidEmail', true);
        this.set('emailMessage', 'Por favor , rellene un correo electrónico válido');
        this.set('color', 'spanColor');
        isValid = false;
        showError = false;
      }

      if (!validateEmail(email) && showError) {
        this.set('invalidEmail', true);
        this.set('emailMessage', 'Email inválido');
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

      if (password.length < 5 && showError) {
        this.set('invalidPassword', true);
        this.set('passwordMessage', 'La contraseña debe tener al menos 6 caracteres .');
        this.set('color', 'spanColor');
        isValid = false;
        showError = false;
      }

      if (Ember.isBlank(firstName) && showError) {
        this.set('invalidFirstName', true);
        this.set('firstNameMessage', 'Por favor , rellene el nombre.');
        this.set('color', 'spanColor');
        isValid = false;
        showError = false;
      }

      if (Ember.isBlank(lastName) && showError) {
        this.set('invalidLastName', true);
        this.set('lastNameMessage', 'Por favor , rellene el apellido');
        this.set('color', 'spanColor');
        isValid = false;
        showError = false;
      }



      if (!this.get('acceptTerms')) {
        this.set('registrationFailed', true);
        this.set('errorMessage', 'Por favor, estar de acuerdo con los términos y condiciones');
        isValid = false;
        showError = false;
      }

      if (isValid) {
        let currentUrl = this.serverUrl.getUrl();
        this.set('authProcess', true);
        Ember.$.ajax({
          type: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          url: `${currentUrl}api/register`,
          data: JSON.stringify({
            first_name: this.get('firstName'),
            last_name: this.get('lastName'),
            email: this.get('email'),
            password: this.get('password'),
            gender: "M",
            phone: this.get('phone') || '',
            replacement_criteria_id: "replace"
          })
        }).then(()=> {
          fbq("track","CompleteRegistration",{content_name:this.get('email')});
          mixpanel.track("registration");
          this.send("authorize", this.get('email'), this.get('password'));
        }).fail((err)=> {
          this.set('authProcess', false);
          var error = JSON.parse(err.responseText);
          this.set('registrationFailed', true);
          this.set('color', 'spanColor');
          if (error.errors.email !== undefined) {
            this.set('errorMessage', 'Registro fallido :' + error.errors.email[0]);
            return;
          }

          if (error.errors['número de teléfono'] !== undefined) {
            this.set('errorMessage', 'Registro fallido :' + error.errors['número de teléfono'][0]);
          }

        });
      }
    }, // submit close
    authorize: function (email, password) {
      Ember.$('body').css('overflow', 'auto');
      let currentUrl = this.serverUrl.getUrl();
      if (this.storage.get(paypal) !== undefined) {
        this.set("params", this.storage.get(paypal));
      }
      this.send('setSession', email, password, currentUrl, this.get("params"));
    },
    setSession: function (email, password, currentUrl, data) {
      if (data === undefined) {
        return this.get('session').authenticate('authenticator:rappi', email, password, currentUrl).then(()=> {
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
      });
    }
  }
});
