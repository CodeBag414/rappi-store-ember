import Ember from 'ember';
import ENV from 'rappi/config/environment';

/**
 * This controller is responsible for displaying data for
 * user profile and update data for user profile.
 */
export default Ember.Controller.extend({
  serverUrl: Ember.inject.service('server-url'),
  flashMessages: Ember.inject.service(),
  selectedCriteria: null,
  selectedGender: null,
  disableSubmit: false,
  session: Ember.inject.service('session'),
  tempPhone: null,
  updateProcess: false,
  parentController: null,
  defer: Ember.RSVP.defer(),
  store: Ember.inject.service(),
  actions: {
    updatePhone(model){
      if (typeof window.AccountKit === 'undefined') {
        this.get('flashMessages').info('Algo salió mal. Por favor, intente después de algún tiempo.');
        return;
      }
      const accessToken = this.get('session').get('data.authenticated.access_token');
      const phonePrefix = this.get('phonePrefix');
      let self = this;
      this.get('parentController').set('currentlyLoading', true);
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
              self.get('parentController').set('currentlyLoading', false);
              self.get('flashMessages').info(`Se le permite verificar sólo el número de teléfono de ${self.get('countryName')}.`);
              return;
            }
            model.set('phone', response.phone.national_number);
            model.save().then(()=> {
              self.get('parentController').set('currentlyLoading', false);
              self.get('flashMessages').success("Los datos guardados con éxito");
            }).catch((err)=> {
              self.get('parentController').set('currentlyLoading', false);
              self.get('flashMessages').danger("Algo salió mal.");
            });
          }).catch((err)=> {
            console.log("err>>>", err);
            self.get('parentController').set('currentlyLoading', false);
            self.get('flashMessages').danger("Algo salió mal.");
          })
        }
        else if (response.status === "NOT_AUTHENTICATED") {
          // handle authentication failure
          self.get('parentController').set('currentlyLoading', false);
          self.get('flashMessages').danger("NOT_AUTHENTICATED");
        }
        else if (response.status === "BAD_PARAMS") {
          // handle bad parameters
          self.get('parentController').set('currentlyLoading', false);
          self.get('flashMessages').danger("BAD_PARAMS");
        }
      });
    },
    /**
     * Function to update the profile changes to the server
     * @param model
     */
    submit: function (model) {
      this.set('disableSubmit', true);
      let currentUrl = this.serverUrl.getUrl();

      let errMsg = "";
      if (Ember.isEmpty(model.get('first_name'))) {
        errMsg += "Primer nombre no puede estar en blanco, ";
      } else if (model.get('first_name').length > 20) {
        errMsg += "Primer nombre no puede ser superior a 20 caracteres, ";
      }
      if (Ember.isEmpty(model.get('last_name'))) {
        errMsg += "Apellido no puede estar en blanco, ";
      } else if (model.get('last_name').length > 20) {
        errMsg += "Apellido no puede ser superior a 20 caracteres, ";
      }

      if (errMsg.trim().length > 0) {
        errMsg = errMsg.substr(0, errMsg.lastIndexOf(','));
        this.get('flashMessages').info(errMsg);
        return;
      }

      let selectedGender = this.get('selectedGender');
      if (selectedGender) {
        model.set('gender', selectedGender);
        this.set('selectedGender', null);
      }

      let criteria = this.get('selectedCriteria');
      if (criteria) {
        model.set('replacement_criteria_id', criteria);
        this.set('selectedCriteria', null);
      }

      let birthDate = this.get('selectedBirthDate');
      if (birthDate) {
        model.set('birth_date', new Date(birthDate));
        this.set('selectedBirthDate', null);
      }


      this.set("updateProcess", true);
      this.get('parentController').set('currentlyLoading', true);
      model.save().then(()=> {
        this.get('parentController').set('currentlyLoading', false);
        this.set("updateProcess", false);
        this.get('flashMessages').success("Los datos guardados con éxito");
      }).catch((err)=> {
        this.get('parentController').set('currentlyLoading', false);
        this.get('flashMessages').danger("Algo salió mal.");
        this.set("updateProcess", false);
      });
      this.set('disableSubmit', true);
    },
    /**
     * Collect criteria value selected by the user
     * @param criteria
     */
    onSelectCriteria: function (criteria) {
      this.set('selectedCriteria', criteria);
    },
    /**
     * Collect gender value selected by the user
     * @param gender
     */
    onSelectGender: function (gender) {
      this.set('selectedGender', gender);
    },
    /**
     * To upload the image selected by the user
     * @param filePath
     */
    onImageSelect: function (thisController, event) {
      var file = event.target.files[0];
      let currentUrl = this.serverUrl.getUrl();

      var data = new FormData();
      data.append('image', file);
      var session = this.get('session');
      if (session.isAuthenticated) {
        var accessToken = session.get('data.authenticated.access_token');
        var headers = {};
        headers['Authorization'] = `Bearer ${accessToken}`;
        Ember.$.ajax({
          type: "POST",
          url: `${currentUrl}/${ENV.profilePicUrl}`,
          data: data,
          headers: headers,
          cache: false,
          contentType: false,
          processData: false
        }).then((rsp)=> {
          var model = this.get('model');
          model.set('pic', rsp);
        }).fail((err)=> {
          console.log("err>> is ...", err);
        });
      } else {
        this.transitionToRoute('index');
      }
    }, logout() {
      this.get('session').invalidate();
    }
  }
})
;

