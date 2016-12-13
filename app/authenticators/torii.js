import Ember from 'ember';
import Torii from 'ember-simple-auth/authenticators/torii';
import ENV from 'rappi/config/environment';

const { inject: { service } } = Ember;
const { RSVP, isEmpty, run } = Ember;
const assign = Ember.assign || Ember.merge;

export default Torii.extend({
  torii: service(),
  ajax: service(),
  refreshAccessTokens: true,

  _refreshTokenTimeout: null,
  restore(data) {
    return new RSVP.Promise((resolve, reject) => {
      const now = (new Date()).getTime();
      const refreshAccessTokens = this.get('refreshAccessTokens');
      if (!isEmpty(data['expires_at']) && data['expires_at'] < now) {
        if (refreshAccessTokens) {
          this._refreshAccessToken(data['expires_in'], data['refresh_token']).then(resolve, reject);
        } else {
          reject();
        }
      } else {
        if (isEmpty(data['access_token'])) {
          reject();
        } else {
          this._scheduleAccessTokenRefresh(data['expires_in'], data['expires_at'], data['refresh_token']);
          resolve(data);
        }
      }
    });
  },
  invalidate(data) {
    const serverTokenRevocationEndpoint = this.get('serverTokenRevocationEndpoint');

    function success(resolve) {
      run.cancel(this._refreshTokenTimeout);
      delete this._refreshTokenTimeout;
      resolve();
    }

    return new RSVP.Promise((resolve) => {
      if (isEmpty(serverTokenRevocationEndpoint)) {
        success.apply(this, [resolve]);
      } else {
        const requests = [];
        Ember.A(['access_token', 'refresh_token']).forEach((tokenType) => {
          const token = data[tokenType];
          if (!isEmpty(token)) {
            requests.push(this.makeRequest(serverTokenRevocationEndpoint, {
              'token_type_hint': tokenType, token
            }));
          }
        });
        const succeed = () => {
          success.apply(this, [resolve]);
        };
        RSVP.all(requests).then(succeed, succeed);
      }
    });
  },
  authenticate(name, redirect_uri, currentUrl, paypalParams) {
    const ajax = this.get('ajax');
    return this._super(...arguments).then((data) => {
      return ajax.request(`${ENV.facebookAccesstoken}` + 'client_id=' + `${ENV.facebookClientId}` + '&redirect_uri=' + encodeURIComponent(`${redirect_uri}`) + '&client_secret=' + `${ENV.facebookClientSecret}` + '&code=' + data.authorizationCode, {
        type: 'GET',
      }).then((response) => {
        return ajax.request(`${ENV.facebookDetails}` + response.access_token, {
          type: 'GET',
        }).then((res) => {
          let gender = res.gender === "male" ? "M" : "F";
          let ajaxRequest;
          var data = {
            'accessToken': response.access_token,
            'client_id': `${ENV.clientId}`,
            'client_secret': `${ENV.clientSecret}`,
            'email': res.email,
            'first_name': res.first_name,
            'gender': gender,
            'identification': 11111111,
            'identification_type': 1,
            'last_name': res.last_name,
            "replacement_criteria_id": "replace",
            "scope": "all",
            "social_id": res.id,
            "phone": ""
          };

          if (paypalParams === undefined) {
            ajaxRequest = ajax.request(`${currentUrl}/${ENV.loginWithFacebook}`, {
              type: 'POST',
              dataType: 'json',
              data: data
            });
          } else {
            data["paypal_customer_id"] = paypalParams.paypal_customer_id;
            data["paypal_tab_id"] = paypalParams.paypal_tab_id;
            data["paypal_location_id"] = paypalParams.paypal_location_id;

            ajaxRequest = ajax.request(`${ENV.paypalAuthWithFacebook}`, {
              type: 'POST',
              dataType: 'json',
              data: data
            });
          }
          return ajaxRequest.then((response) => {
            const expiresAt = this._absolutizeExpirationTime(response['expires_in']);
            this._scheduleAccessTokenRefresh(response['expires_in'], expiresAt, response['refresh_token']);
            if (!isEmpty(expiresAt)) {
              response = assign(response, {'expires_at': expiresAt});
            }
            return response;
          });
        });
      });
    }, (error)=>{
      error;
    });
  },
  _absolutizeExpirationTime(expiresIn) {
    if (!isEmpty(expiresIn)) {
      return new Date((new Date().getTime()) + expiresIn * 1000).getTime();
    }
  },

  _scheduleAccessTokenRefresh(expiresIn, expiresAt, refreshToken) {
    const refreshAccessTokens = this.get('refreshAccessTokens');
    if (refreshAccessTokens) {
      const now = (new Date()).getTime();
      if (isEmpty(expiresAt) && !isEmpty(expiresIn)) {
        expiresAt = new Date(now + expiresIn * 1000).getTime();
      }
      const offset = (Math.floor(Math.random() * 5) + 5) * 1000;
      if (!isEmpty(refreshToken) && !isEmpty(expiresAt) && expiresAt > now - offset) {
        run.cancel(this._refreshTokenTimeout);
        delete this._refreshTokenTimeout;
        if (!Ember.testing) {
          this._refreshTokenTimeout = run.later(this, this._refreshAccessToken, expiresIn, refreshToken, expiresAt - now - offset);
        }
      }
    }
  }
});
