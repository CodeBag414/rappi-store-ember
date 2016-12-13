import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stLat,
  stLng,
  stContent,
  stStoreType,
  stAddress,
  stShippingCharges,
  stAddressId,
  stAddrPopupShown
  } = ENV.storageKeys;

export default Ember.Component.extend({
  showAddAddress: false,
  model: null,
  addressObjCurrent: null,
  activeAddress: null,
  showRightBgImage:true,
  willRender(){
    this._super(...arguments);
    let model = this.get('session').get('currentAddress');
    this.set('model', model);
    let modelCount =0;
    model.forEach((data)=> {
      modelCount++;
      if (data.get('active')) {
        this.set('activeAddress', data);
      }
    });
    if(modelCount>2){
      this.set("showRightBgImage",false);
    }
    let _this = this;
    this.get('session').on('userAddressUpdated', function(address) {
      _this.set('model', address);
    });
  },
  didRender() {
    this._super(...arguments);
    Ps.initialize(document.getElementById("address-a"), {
      wheelSpeed: 2,
      wheelPropagation: true,
      minScrollbarLength: 20
    });
    Ember.$(".new-address-list").scroll(function () {
      if (Ember.$(".new-address-list").scrollTop() > 45) {
        Ember.$(".seleted-address").css({'display': 'none'});
      } else {
        Ember.$(".seleted-address").css({'display': 'block'});
      }
    });
  },
  actions: {
    openAddAddress: function () {
      this.sendAction('showAddAddress');
    },
    selectAddress: function (addressObj) {
      let currentCountry = this.storage.get(stContent) ? this.storage.get(stContent).countryName : ENV.location[0].name;
      var _this = this;
      var geocoder = new window.google.maps.Geocoder();
      var latlng = {lat: parseFloat(addressObj.get('lat')), lng: parseFloat(addressObj.get('lng'))};
      let model = this.get('model');
      geocoder.geocode({'location': latlng}, function (results) {
        var addressComponents = results[0].address_components;
        addressComponents.forEach((component)=> {
          var componentType = component.types;
          if (componentType[0] === 'country') {
            if ((component.long_name === currentCountry) || (component.long_name === 'Mexico')) {
              if (_this.get('activeAddress') !== null) {
                let activeAddress = _this.get('activeAddress');
                activeAddress.set('active', false);
              }
              addressObj.set("active", true);

              _this.set('addressObjCurrent', addressObj);
              if (_this.get('showModal') !== undefined) {
                _this.send('addressChangeAction');
                _this.set('showModal', true);
                _this.set('showAddressList', false);
                _this.storage.set(stAddrPopupShown, true);
                return;
              }

              let addLat = addressObj.get('lat') ? Math.abs(addressObj.get('lat')) : 0;
              let addLng = addressObj.get('lng') ? Math.abs(addressObj.get('lng')) : 0;
              let storageLat = _this.storage.get(stLat) ? Math.abs(_this.storage.get(stLat)) : 0;
              let storageLng = _this.storage.get(stLng) ? Math.abs(_this.storage.get(stLng)) : 0;
              if ((Math.abs(addLat - storageLat) > 0.000001 || Math.abs(addLng - storageLng) > 0.000001) && _this.get('cart').getCart(_this.storage.get(stStoreType)) && _this.get('cart').getCart(_this.storage.get(stStoreType)).get('cartItems').length !== 0) {
                _this.set('showReloadWarning', true);
              } else {
                _this.send('addressChangeAction');
                _this.storage.set(stAddrPopupShown, true);
              }
            } else {
              alert('Por favor, seleccione una dirección de ' + currentCountry);
              return;
            }
          }
        });
      });
    },
    addressChangeAction: function () {
      let addressObj = this.get("addressObjCurrent");
      let storeType = this.storage.get(stStoreType);
      let id = addressObj.get('id');
      let address = addressObj.get('address');
      let description = addressObj.get('description');
      let lng = addressObj.get('lng');
      let lat = addressObj.get('lat');
      let tag = addressObj.get('tag');
      let active = addressObj.get('active');
      let lastorder = addressObj.get('lastorder');
      addressObj.save().then(()=> {
        if (this.get('isCheckout')) {
          this.sendAction('showModalDelevery');
        } else {
          this.set('showPopUp', false);
        }
        let storageAddressId = this.storage.get(stAddressId)
        let addLat = lat ? Math.abs(lat) : 0;
        let addLng = lng ? Math.abs(lng) : 0;
        let storageLat = this.storage.get(stLat) ? Math.abs(this.storage.get(stLat)) : 0;
        let storageLng = this.storage.get(stLng) ? Math.abs(this.storage.get(stLng)) : 0;

        if (Ember.isEmpty(storageAddressId) || storageAddressId.toString !== id.toString()) {
          this.storage.set(stLat, lat);
          this.storage.set(stLng, lng);
          this.storage.set(stAddress, address);
          this.storage.set(stAddressId, id);
          if (Ember.isPresent(storeType)) {
            this.cart.setShippingAddress(storeType, {id, address, description, lng, lat, tag, active, lastorder});
          }
          if ((Math.abs(addLat - storageLat) > 0.000001 || Math.abs(addLng - storageLng) > 0.000001) && this.get('showModal') === undefined) {
            window.location.reload(true);
          }
        }
      });
    }
  }
});
