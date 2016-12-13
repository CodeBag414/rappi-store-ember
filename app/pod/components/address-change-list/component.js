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
  model: null,
  closeButton: true,
  init(){
    this._super(...arguments);
    this.set('model', this.get('session').get('currentAddress'));
    if (this.get("params") !== undefined) {
      this.set("closeButton", false);
    }
  },
  actions: {
    getModel: function (addressObj) {
      this.set('inactiveAddressModel', addressObj);
      this.set('activeAddressModel', []);
      this.get('model').forEach((address)=> {
        if (address.get('active')) {
          this.set('activeAddressModel', address);
          return;
        }
      });
    },
    updateActive: function () {
      var inactiveModel = this.get('inactiveAddressModel');
      let addLat = inactiveModel.get('lat') ? Math.abs(Number(inactiveModel.get('lat'))) : 0;
      let addLng = inactiveModel.get('lng') ? Math.abs(Number(inactiveModel.get('lng'))) : 0;
      let storageLat = this.storage.get(stLat) ? Math.abs(this.storage.get(stLat)) : 0;
      let storageLng = this.storage.get(stLng) ? Math.abs(this.storage.get(stLng)) : 0;

      if ((Math.abs(addLat - storageLat) > 0.000001 || Math.abs(addLng - storageLng) > 0.000001) && this.get('cart').getCart(this.storage.get(stStoreType)) && this.get('cart').getCart(this.storage.get(stStoreType)).get('cartItems').length !== 0) {
        this.set('showReloadWarning', true);
      } else {
        this.send('addressChangeAction');
      }
    },
    showDialog: function () {
      this.sendAction('toggleAddAddress');
    },
    toggleView: function () {
      this.set('showAddressListToUpdate', false);
    },
    addressChangeAction: function () {
      var inactiveModel = this.get('inactiveAddressModel');
      var activeModel = this.get('activeAddressModel');
      var inactiveLat = inactiveModel.get('lat');
      var inactiveLng = inactiveModel.get('lng');
      var currentCountry;
      var _this = this;

      var geocoder = new window.google.maps.Geocoder();
      var latlng = {lat: parseFloat(inactiveLat), lng: parseFloat(inactiveLng)};
      currentCountry = this.storage.get(stContent) ? this.storage.get(stContent).countryName : ENV.location[0].name;
      geocoder.geocode({'location': latlng}, function (results) {
        var addressComponents = results[0].address_components;
        addressComponents.forEach((component)=> {
          var componentType = component.types;
          if (componentType[0] === 'country') {
            if ((component.long_name === currentCountry) || (component.long_name === 'Mexico')) {
              if (inactiveModel !== null) {
                inactiveModel.set('active', true);
              }
              if (activeModel !== null) {
                activeModel.set('active', false);
              }
              if (inactiveModel !== null) {
                inactiveModel.save();
                _this.storage.set(stLat, inactiveModel.get('lat'));
                _this.storage.set(stLng, inactiveModel.get('lng'));
                _this.storage.set(stAddress, inactiveModel.get('address'));
                _this.storage.set(stAddressId, inactiveModel.get('id'));
                _this.set('showAddressListToUpdate', false);

                let addLat = inactiveModel.get('lat') ? Math.abs(Number(inactiveModel.get('lat'))) : 0;
                let addLng = inactiveModel.get('lng') ? Math.abs(Number(inactiveModel.get('lng'))) : 0;
                let storageLat = _this.storage.get(stLat) ? Math.abs(_this.storage.get(stLat)) : 0;
                let storageLng = _this.storage.get(stLng) ? Math.abs(_this.storage.get(stLng)) : 0;



                if (_this.get("params") !== undefined) {
                  _this.get('router').transitionTo('home.store', _this.get('storeType'));
                  return;
                }
                if (window.location.toString().split("#")[1] === undefined) {
                  _this.get('router').transitionTo('home.store', ENV.defaultStoreType);
                } else {
                  window.location.reload(true);
                }
              }
            } else {
              alert('dirección que seleccionó es diferente del país');
            }
          }
        });
      });
    }
  }
});
