import Ember from 'ember';
import ENV from 'rappi/config/environment';

export default Ember.Controller.extend({
  serverUrl: Ember.inject.service('server-url'),
  currentPwd: null,
  newPwd: null,
  confirmPwd: null,
  session: Ember.inject.service('session'),
  parentController: null,
  actions: {
    onKeyPress: function () {
      this.set('invalidCurrentPassword', false);
      this.set('invalidNewPassword', false);
      this.set('invalidConfirmPassword', false);
      this.set('changePasswordFailed', false);
      this.set('changePasswordSuccess', false);
    },
    submit: function () {
      var existingPassword = this.get('currentPwd');
      var newPassword = this.get('newPwd');
      var confirmNewPassword = this.get('confirmPwd');
      var flag = true;
      let currentUrl = this.serverUrl.getUrl();

      if (Ember.isBlank(existingPassword)) {
        this.set("invalidCurrentPassword", true);
        this.set("currentPasswordMessage", "Enter current password");
        flag = false;
      }
      if (flag && Ember.isBlank(newPassword)) {
        this.set("invalidNewPassword", true);
        this.set("newPasswordMessage", "Enter new password");
        flag = false;
      }
      if (flag && (newPassword.length < 6)) {
        this.set("invalidNewPassword", true);
        this.set("newPasswordMessage", "Password Length is less then six character!");
        flag = false;
      }
      if (flag && existingPassword === newPassword) {
        this.set("invalidNewPassword", true);
        this.set("newPasswordMessage", "New password is same as Current Password!");
        flag = false;
      }
      if (flag && Ember.isBlank(confirmNewPassword)) {
        this.set("invalidConfirmPassword", true);
        this.set("confirmPasswordMessage", "Please, fill in confirm password.");
        flag = false;
      }
      if (flag && newPassword !== confirmNewPassword) {
        this.set("invalidConfirmPassword", true);
        this.set("confirmPasswordMessage", "Password not match!");
        flag = false;
      }

      var session = this.get('session');
      if (!session.isAuthenticated) {
        //User session is not valid hence we are redirecting it to the home page
        this.transitionToRoute('index');

      } else if (flag) {
        this.get('parentController').set('currentlyLoading', true);
        var accessToken = session.get('data.authenticated.access_token');
        Ember.$.ajax({
          type: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          url: `${currentUrl}${ENV.changePassword}`,
          data: {
            oldpassword: existingPassword,
            newpassword: newPassword,
            newpassword_confirmation: confirmNewPassword
          }
        }).then(()=> {
          //TODO need to display message that password has been changed successfully
          this.set("successMessage", "La contraseña ha sido cambiada con éxito.");
          this.set("changePasswordSuccess", true);
          this.get('parentController').set('currentlyLoading', false);
        }).fail(()=> {
          //TODO need to display that there is some error due to which you are not able to change the password
          this.set("errorMessage", "Cambio de contraseña falló.");
          this.set("changePasswordFailed", true);
          this.get('parentController').set('currentlyLoading', false);
        });

      }
      /*else {
       //TODO We have to display info that either password length is not sufficient or password mismatch
       alert(errorText);
       }*/
    },
    logout() {
      this.get('session').invalidate();
    }
  }
});
