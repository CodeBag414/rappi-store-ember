import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stLat,
  stLng,
  stAddress,
  stAddressId,
  stContent,
  stStoreType
  } = ENV.storageKeys;

export default Ember.Component.extend({
  store: Ember.inject.service(),
  serverUrl: Ember.inject.service('server-url'),
  flashMessages: Ember.inject.service(),
  currentAddress: null,
  subAddress: null,
  addressTextBoxValue: null,
  latCurrentAddress: -34.397,
  lngCurrentAddress: 150.644,
  selectedTag: "casa",
  description: null,
  country: {country: "CO"},
  isDisable: true,
  buttonText: null,
  closeButton: true,
  dragAllow: false,
  resultLogin: '',
  currentlyLoading: false,
  session: Ember.inject.service('session'),
  init() {
    this._super(...arguments);
    let addresses = this.get('session').get('currentAddress');
    this.set('latCurrentAddress', this.storage.get(stLat));
    this.set('lngCurrentAddress', this.storage.get(stLng));
    this.set('currentAddress', this.storage.get(stAddress));
    this.set('addressTextBoxValue', this.storage.get(stAddress));

    let content = this.storage.get(stContent);
    if (content !== undefined) {
      this.set("country", {country: content.code});
    }

    if (!Ember.isPresent(addresses)) {
      this.set('buttonText', 'Agregar');
    } else if (this.get('flow') === 'profile' || this.get('flow') === 'login') {
      this.set('buttonText', 'GUARDAR');
    } else {
      this.set('buttonText', 'COMPLETAR COMPRA');
    }
    if (this.get("params") !== undefined) {
      this.set("closeButton", false);
    }
  },
  didReceiveAttrs() {
    this._super(...arguments);
    if (this.get('isCheckout')) {
      var this_ = this;
      let modelArrayPromise = this.get('session').get('currentAddress');
      if (modelArrayPromise) {
        modelArrayPromise.then(function () {
          if (Ember.isPresent(modelArrayPromise)) {
            modelArrayPromise.forEach((addressObj)=> {
              if (addressObj.get('active')) {
                this_.set('latCurrentAddress', addressObj.get('lat'));
                this_.set('lngCurrentAddress', addressObj.get('lng'));
                this_.set('currentAddress', addressObj.get('address'));
                this_.set('addressTextBoxValue', addressObj.get('address'));
              }
            });
          }
        });
      }
    }
  },
  actions: {
    findLatLong: function (address) {
      if (address !== null) {
        this.set('currentAddress', address.formatted_address);
        this.set('latCurrentAddress', address.geometry.location.lat());
        this.set('lngCurrentAddress', address.geometry.location.lng());
        var addressComponents = address.address_components;
        addressComponents.forEach((component)=> {
          var componentType = component.types;
          if (componentType[0] === 'country') {
            this.set('selectedCountry', component.long_name);
          }
        });
      }
    },

    addDetail(detail) {
      if (detail !== null && detail.length > 0) {
        this.set('subAddress', detail);
        var currAddress = this.get('currentAddress');
        this.set("addressTextBoxValue", currAddress);
        currAddress = currAddress + "," + detail;
        this.set('currentAddress', currAddress);
      }
    },

    selectTag: function (tag) {
      this.$(".active").removeClass();
      this.set('selectedTag', tag);
      if (tag === "novi@") {
        tag = "novi";
      }
      this.$('#' + tag).addClass("active");
    },

    getDescription: function (description) {
      if (description !== null) {
        this.set('description', description);
      }
    },

    onFocusOut: function () {
      let inputValue = Ember.$("#googlePlaceContainer").children("div").children('input').val();
      this.set('currentAddress', inputValue);
      this.set('lngCurrentAddress', 0);
      this.set('latCurrentAddress', 0);
    },

    submit: function () {
      var isValid = true;
      let currentUrl = this.serverUrl.getUrl();
      if (Ember.isBlank(this.get('addressTextBoxValue')) || Ember.isBlank(this.get('currentAddress'))) {
        this.get('flashMessages').info('La dirección no puede dejarse en blanco');
        isValid = false;
      } else if (this.get('latCurrentAddress') === 0 && this.get('lngCurrentAddress') === 0) {
        this.get('flashMessages').info('Por favor, seleccione una dirección válida');
        isValid = false;
      }
      if (Ember.isBlank(this.get('selectedTag'))) {
        this.set('selectedTag', 'otra');
      }

      if (isValid) {
        this.set('currentlyLoading', true);
        let currentCountry = this.storage.get(stContent) ? this.storage.get(stContent).countryName : ENV.location[0].name;
        var _this = this;
        var geocoder = new window.google.maps.Geocoder();
        var latlng = {lat: parseFloat(this.get('latCurrentAddress')), lng: parseFloat(this.get('lngCurrentAddress'))};
        geocoder.geocode({'location': latlng}, function (results) {
          var addressComponents = results[0].address_components;
          addressComponents.forEach((component)=> {
            var componentType = component.types;
            if (componentType[0] === 'country') {
              _this.set('selectedCountry', component.long_name);
              if ((currentCountry === _this.get('selectedCountry')) || (_this.get('selectedCountry') === 'Mexico')) {
                var store = _this.get('targetObject.store');
                var lat = _this.get('latCurrentAddress');
                var lng = _this.get('lngCurrentAddress');
                if (!(lat && lng)) {
                  return;
                }
                return Ember.$.ajax({
                  type: "GET",
                  url: `${currentUrl}${ENV.searchStore}lat=${lat}&lng=${lng}`,
                }).then(()=> {
                  var newAddress = _this.get('store').createRecord('address', {
                    address: _this.get('currentAddress'),
                    description: _this.get('description'),
                    lat: _this.get('latCurrentAddress'),
                    lng: _this.get('lngCurrentAddress'),
                    tag: _this.get('selectedTag'),
                    active: true
                  });
                  newAddress.save().then(function (result) {
                    if (_this.get('flow') === 'checkout') {
                      let storeType = _this.storage.get(stStoreType);
                      let id = result.get('id');
                      let address = result.get('address');
                      let description = result.get('description');
                      let lng = result.get('lng');
                      let lat = result.get('lat');
                      let tag = result.get('tag');
                      let active = result.get('active');
                      let lastorder = result.get('lastorder');
                      _this.storage.set(stLat, lat);
                      _this.storage.set(stLng, lng);
                      _this.storage.set(stAddressId, id);
                      _this.storage.set(stAddress, address);
                      _this.cart.setShippingAddress(storeType, {
                        id,
                        address,
                        description,
                        lng,
                        lat,
                        tag,
                        active,
                        lastorder
                      });
                      _this.set('currentlyLoading', false);
                      _this.sendAction('showModalDelevery');
                    } else if (_this.get('flow') === 'profile') {
                      _this.set('showPopUp', false);
                      _this.set('model', store.findAll('address'));
                      _this.set('currentlyLoading', false);
                    } else if (_this.get('flow') === 'login' || _this.get('flow') === 'change-direction') {
                      _this.set('resultLogin', result);

                      let addLat = result.get('lat') ? Math.abs(Number(result.get('lat'))) : 0;
                      let addLng = result.get('lng') ? Math.abs(Number(result.get('lng'))) : 0;
                      let storageLat = _this.storage.get(stLat) ? Math.abs(_this.storage.get(stLat)) : 0;
                      let storageLng = _this.storage.get(stLng) ? Math.abs(_this.storage.get(stLng)) : 0;
                      if ((Math.abs(addLat - storageLat) > 0.000001 || Math.abs(addLng - storageLng) > 0.000001) && _this.get('cart').getCart(_this.storage.get(stStoreType)) && _this.get('cart').getCart(_this.storage.get(stStoreType)).get('cartItems').length !== 0) {
                        _this.set('showReloadWarning', true);
                      } else {
                        _this.send('addressChangeAction');
                      }
                    }
                  });
                }).fail((err)=> {
                  _this.set('currentlyLoading', false);
                  let errMsg = `${err.statusText}: `;
                  if (Ember.isPresent(err.responseJSON) && Ember.isPresent(err.responseJSON.error)) {
                    errMsg = err.responseJSON.error.message;
                  }
                  _this.get('flashMessages').danger(errMsg);
                });
              } else {
                _this.get('flashMessages').danger('Por favor, añadir una dirección de ' + currentCountry);
                isValid = false;
                _this.set('currentlyLoading', false);
              }
            }
          });
        });
      }
    },
    addressChangeAction: function () {
      var result = this.get('resultLogin');
      let currentCountry = this.storage.get(stContent) ? this.storage.get(stContent).countryName : ENV.location[0].name;

      let addLat = result.get('lat') ? Math.abs(Number(result.get('lat'))) : 0;
      let addLng = result.get('lng') ? Math.abs(Number(result.get('lng'))) : 0;
      let storageLat = this.storage.get(stLat) ? Math.abs(this.storage.get(stLat)) : 0;
      let storageLng = this.storage.get(stLng) ? Math.abs(this.storage.get(stLng)) : 0;

      this.storage.set(stLat, result.get('lat'));
      this.storage.set(stLng, result.get('lng'));
      this.storage.set(stAddress, result.get('address'));
      this.storage.set(stAddressId, result.get('id'));
      if (this.get('flow') === 'login') {
        this.storage.set("id", result.get('id'));


        if (this.get("params") !== undefined) {
          this.get('router').transitionTo('home.store', this.get('storeType'));
          return;
        }
        this.set('showAddAddressToUpdate', false);

        if (window.location.toString().split("#")[1] === undefined) {
          this.set('showModal', true);
        } else {
          this.get('router').transitionTo('index');
        }
      } else {
        let storeType = this.storage.get(stStoreType);
        let id = result.get('id');
        let address = result.get('address');
        let description = result.get('description');
        let lng = result.get('lng');
        let lat = result.get('lat');
        let tag = result.get('tag');
        let active = result.get('active');
        let lastorder = result.get('lastorder');
        this.cart.setShippingAddress(storeType, {
          id,
          address,
          description,
          lng,
          lat,
          tag,
          active,
          lastorder
        });
        this.set('showPopUp', false);
        this.set('currentlyLoading', false);
        this.set('removeAddressList', false);

        if (this.get('flow') === 'change-direction') {
          window.location.reload(true);
        }
      }
    },
    toggleTextField: function () {
      this.toggleProperty('isDisable');
    },
    toggleView: function () {
      this.set('showPopUp', false);
      if (this.get('removeAddressList')) {
        this.set('removeAddressList', false);
      }
      this.set('showAddAddressToUpdate', false);
      this.set('showAddressList', true);
    },
    dragPermission: function () {
      this.toggleProperty('dragAllow');
    }
  }
});
