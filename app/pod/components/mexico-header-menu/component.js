import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stLat,
  stLng,
  stAddress,
  stContent,
  stStoreType,
  stShippingCharges,
  stAddressId
  } = ENV.storageKeys;

export default Ember.Component.extend({
  countryBanner: true,
  init() {
    this._super(...arguments);
    let _this = this;
    let content = this.storage.get(stContent);
    if (content !== undefined) {
      this.set('currentCountry', content.countryName);
      if (content.countryName === "Mexico") {
        this.set("countryBanner", false);
      }
    }
  },
  actions: {
    countryOption: function () {
      this.set('unSelectedCountry', true);
    },
    selectCountry: function (countryName) {
      let _this = this;
      let value = countryName === 'colombia' ? 0 : 1;
      let envLoction = ENV.location;
      let location = envLoction[value][envLoction[value].name];

      let lat = location.lat;
      let lng = location.lng;
      let session = this.get('session');
      this.set('currentlyLoading', true);
      this.apiService.get(`${ENV.rappiServerURL}${ENV.resolveCountry}lat=${lat}&lng=${lng}`, null)
        .then((resp)=> {
          resp.server = resp.server.replace('http://', 'https://');
          resp.countryName = resp.code === 'MX' ? "Mexico" : resp.name;
          this.serverUrl.currentUrl(resp);
          this.serverUrl.setdataByCountry(()=> {
            resp.currentCountry = resp.countryName;
            this.storage.set(stLat, lat);
            this.storage.set(stLng, lng);
            this.storage.set(stContent, resp);
            if (session.get("isAuthenticated")) {
              this.logout();
              return;
            }
            _this.get('router').transitionTo('index');
          });
        }, (error)=> {

          this.set('currentlyLoading', false);
        });
      this.set('unSelectedCountry', false);
    },
    logout() {
      this.get('session').invalidate();
    }
  }
});
