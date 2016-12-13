import Ember from 'ember';

export default Ember.Component.extend({
  forgotPasswordSuccess: false,
  actions: {
    forgotPassword: function () {
      var email = this.get('recoveryEmail');
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
      if (isValid) {
        let currentUrl = this.serverUrl.getUrl();
        this.set('recoveryProgress', true);
        Ember.$.ajax({
          type: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          url: `${currentUrl}api/recoverpassword`,
          data: JSON.stringify({
            email: this.get('recoveryEmail'),
          })
        }).then(()=> {
          this.set("forgotPasswordSuccess", true);
        }).fail((err)=> {
          this.set('recoveryProgress', false);
          this.set('invalidEmail', true);
          var error = JSON.parse(err.responseText).error;
          this.set('emailMessage',error.message);
        });
      }
    },
    onKeyPress: function () {
      this.set('invalidEmail', false);
    },
    goBack(){
      this.set('showRecoverPassword', false);
    },
  }
});
