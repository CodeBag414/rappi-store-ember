import Ember from 'ember';
import ENV from 'rappi/config/environment';
const {
  stLat,
  stLng,
  stAddress,
  stAddressId,
  stContent,
  paypal
  } = ENV.storageKeys;

export default Ember.Route.extend({
  reasonMessage: 'Progressing.....',
  setupController: function (controller, model) {
    this._super(controller, model);
    controller.set("reasonMessage", this.get("reasonMessage"));
  },
  model: function (params) {
    this.controllerFor('paypal').set('loadingImg', true);

    let currentUrl = this.serverUrl.getUrl();
    let parameter = {
      "paypal_customer_id": params.customerId,
      "paypal_tab_id": params.tabId,
      "paypal_location_id": params.locationId,
      "storeType": params.storeType
    };

    let location = ENV.location[1].México;
    this.storage.set(stLat, location.lat);
    this.storage.set(stLng, location.lng);
    this.storage.set(stAddress, 'México');
    this.storage.set(stAddressId, 0);
    this.apiService.get(`${ENV.rappiServerURL}${ENV.resolveCountry}lat=${location.lat}&lng=${location.lng}`, null)
      .then((resp)=> {
        resp.server = resp.server.replace('http://', 'https://');
        resp.countryName = resp.code === 'MX' ? "México" : resp.name;
        this.serverUrl.currentUrl(resp);
        this.serverUrl.setdataByCountry(()=> {
          this.storage.set(stContent, resp);
        });
        this.send("urlParam", parameter);
        this.storage.set(paypal, parameter);
        this.get('session').authenticate('authenticator:paypal-authenticator', parameter, currentUrl).then(()=> {
          this.setLatLng(params.storeType);
        }).catch((reason) => {
          this.send("message", "error");
          return;
          //this.transitionTo("paypal.store", params.storeType);
        });
      }, (error)=> {
        console.log(error);
      });
  },
  setLatLng(storeType){
    Ember.run.later(this, ()=> {
      if (this.get('session').get('currentUser').get("name") === undefined || Array.isArray(this.get('session').get('currentAddress'))) {
        this.setLatLng(storeType);
      } else {
        Ember.run.later(this, ()=> {
          var activeLat;
          var activeLong;
          var activeAddressId;
          var activeAddress;
          var addresses = this.get('session').get('currentAddress');
          if (Ember.isPresent(addresses)) {
            addresses.forEach((addressObj)=> {
              if (addressObj.get('active')) {
                activeLat = addressObj.get('lat');
                activeLong = addressObj.get('lng');
                activeAddressId = addressObj.get('id');
                activeAddress = addressObj.get('address');
                this.storage.set(stLat, activeLat);
                this.storage.set(stLng, activeLong);
                this.storage.set(stAddressId, activeAddressId);
                this.storage.set(stAddress, activeAddress);
                this.transitionTo('paypal.store', storeType);
                return;
              }
            });
            if (activeLat === undefined && activeLong === undefined) {
              this.controller.set('showAddressListToUpdate', true);
              this.controller.set('storeType', storeType);
            }
          } else {
            this.controller.set('showAddAddressToUpdate', true);
            this.controller.set('storeType', storeType);
          }
        }, 1200);
      }
    }, 500);
  },
  afterModel()
  {
    this.serverUrl.setPayPalENV();
  },
  actions: {
    message: function (message) {
      console.log("Sads",message);
      this.controller.set("reasonMessage", message);
      this.controllerFor('paypal').set('reasonMessage', message.paypal);
      this.controllerFor('paypal').set('showLogin', true);
    },
    urlParam: function (params) {
      this.controller.set('params', params);
    }
  }
})
;
