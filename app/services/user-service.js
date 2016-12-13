import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stContent
  } = ENV.storageKeys;

export default Ember.Service.extend({
  setDataAfterAuthorize: function (that, addresses) {
    var activeLat;
    var activeLong;
    var activeAddress;
    var activeAddressId;
    var storeType = that.get("params") === undefined ? ENV.defaultStoreType : that.get("params").storeType;
    if (that.get('loginFrom') !== 'checkout') {
      Ember.run.later(this, ()=> {
        var currentCountry;
        var _this = that;
        var geocoder = new window.google.maps.Geocoder();
        /*If the user have any address*/
        if (Ember.isPresent(addresses)) {
          addresses.forEach((addressObj)=> {
            if (addressObj.get('active')) {
              activeLat = addressObj.get('lat');
              activeLong = addressObj.get('lng');
              activeAddress = addressObj.get('address');
              activeAddressId = addressObj.get('id');
            }
          });
          var latlng = {lat: parseFloat(activeLat), lng: parseFloat(activeLong)};
          currentCountry = that.storage.get(stContent) ? that.storage.get(stContent).countryName : ENV.location[0].name;
          geocoder.geocode({'location': latlng}, function (results) {
            if (results[0] === undefined) {
              _this.set('showAddressListToUpdate', true);
              _this.set('showModalReg', false);
              return;
            } else {
              var addressComponents = results[0].address_components;
              addressComponents.forEach((component)=> {
                var componentType = component.types;
                if (componentType[0] === 'country') {
                  /*If the active country is same as the country in combo box*/
                  console.log((component.long_name === currentCountry) || (component.long_name === 'Mexico'));
                  if ((component.long_name === currentCountry) || (component.long_name === 'Mexico')) {
                    if (_this.get("showAddressList") !== undefined) {
                      _this.set('showAddressList', true);
                      _this.set('showModalReg', false);
                      return;
                    }
                    if (window.location.toString().split("#!")[1] === undefined) {
                      _this.get('router').transitionTo('home.store', storeType);
                    } else if (window.location.toString().split("#!")[1].split("/")[1].trim() === "paypal") {
                      _this.get('router').transitionTo('paypal.store', storeType);
                    } else {
                      window.location.reload(true);
                    }
                  } else {
                    _this.set('showAddressListToUpdate', true);
                  }
                  _this.set('showModalReg', false);
                }
              });
            }
          });
        } else {
          /*If the user dont have any addresses*/
          that.set('showAddAddressToUpdate', true);
          that.set('showModalReg', false);
        }
      }, 1500);
    } else {
      if (that.get("showAddressList") !== undefined) {
        that.set('showAddressList', true);
        that.set('showModalReg', false);
        that.sendAction('loggedIn');
        return;
      }
    }
    let phone = that.get('session').get('currentUser').get("phone");
    if (phone === "" || phone === undefined) {
      if (!that.get("phoneVerification")) {
        that.set("phoneVerification", true);
      }
    }
    that.sendAction('loggedIn');
  }
});
