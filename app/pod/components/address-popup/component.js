import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stLat,
  stLng,
  stAddress,
  stContent,
  stAddressId,
  stAddrPopupShown,
  stCity,
  } = ENV.storageKeys;

export default Ember.Component.extend({
  serverUrl: Ember.inject.service('server-url'),
  country: {country: "CO"},
  selectedCountry: null,
  place: null,
  completeAddress: null,
  lat: null,
  lng: null,
  addressHistory: [],
  showAddressHistory: false,
  showFaderLabel: false,
  showFaderLabel1: false,
  currentCity: "Bogotá",
  showCityList: false,
  init() {
    this._super(...arguments);
    let content = this.storage.get(stContent);
    if (content !== undefined) {
      this.set("country", {country: content.code});
    }
    let addressHistory = this.storage.get("addressHistory");
    if (addressHistory) {
      this.set("addressHistory", addressHistory);
      if (addressHistory.length > 0) {
        this.set("showAddressHistory", true);
      }
    }
    this.storage.set(stCity, this.get('currentCity'));
  },
  didRender() {
    this._super(...arguments);
    Ember.$("#googlePlaceContainer").children("div").children('input').attr("placeholder", "Ingresa dirección");
    Ember.$("#googlePlaceContainer").children("div").children('input').focus(function () {
      Ember.$("#addressHistory").css("display", "block");
    });
  },
  didUpdateAttrs() {
    let message = this.get('message');
    if (Ember.isPresent(message)) {
      this.set('showFaderLabel', true);
      let _this = this;
      Ember.run.later(function () {
        _this.set('message', null);
        _this.set('showFaderLabel', false);
      }, 3000);
    }
    let message1 = this.get('message1');
    if (Ember.isPresent(message1)) {
      this.set('showFaderLabel1', true);
      let _this = this;
      Ember.run.later(function () {
        _this.set('message1', null);
        _this.set('showFaderLabel1', false);
      }, 3000);
    }
    this._super(...arguments);
  },
  actions: {
    showLogin() {
      this.sendAction('showLoginFromAddressPopup');
    },
    toggleCityList() {
      this.toggleProperty('showCityList');
    },
    selectCity(city) {
      this.set('showCityList', false);
      this.set('currentCity', city);
      this.storage.set(stCity, city);
    },
    hideOverlay() {
      Ember.$('.address-popup-overlay').css('display', 'none');
    },
    saveAddress() {
      let lat = this.get('lat');
      let lng = this.get('lng');
      let completeAddress = this.get('completeAddress');
      let aptoAddress = Ember.$('#apto').val();
      if (!(lat && lng)) {
        this.set('showFaderLabel', true);
        this.set('message', "Por favor selecciona una dirección de la lista");
        return;
      }
      if (Ember.isBlank(aptoAddress)) {
        this.set('showFaderLabel1', true);
        this.set('message1', "¿Oficina, apartamento o casa?");
        return;
      }
      let place = this.get('place');
      if (Ember.isPresent(place)) {
        this.send("addAddressHistory", place);
        this.set('place', null);
      }
      if (this.serverUrl.isPayPalENV()) {
        mixpanel.track("paypal_address_popup_address_submit");
      } else {
        mixpanel.track("address_popup_address_submit");
      }
      this.storage.set(stLat, lat);
      this.storage.set(stLng, lng);
      this.storage.set(stAddress, completeAddress + ", " + aptoAddress);
      this.storage.set(stAddressId, "0");
      this.set('lng', null);
      this.set('lat', null);
      this.set('completeAddress', null);
      this.set('showAddressPopup', false);
      this.storage.set(stAddrPopupShown, true);
      window.location.reload(true);
    },
    /* This function is called when focus is lost from input box
     * and clear properties latitude/longitude/completeAddresse
     * from storage accordingly.
     */
    focusOut() {
      let inputValue = Ember.$("#googlePlaceContainer").children("div").children('input').val();
      if (!this.get('isShowingModal') && (!inputValue || inputValue.trim().length === 0)) {
        this.set('completeAddress', null);
        this.set('lng', null);
        this.set('lat', null);
        this.set('showFaderLabel', false);
        this.set('disableSearch', true);
      }
      Ember.run.later(this, ()=> {
        Ember.$("#addressHistory").css("display", "none");
      }, 200);
      this.set('ignoreFirst', false);
    },
    /* This function is called every time when a place is selected from list
     * and set the properties latitude/longitude/completeAddresse
     * in storage accordingly.
     */
    placeChanged: function (place) {
      if (Ember.isPresent(place) && place.name === this.get('completeAddress')) {
        return;
      }
      if (place.adr_address) {
        let regexp = /(<span(?: \w+="[^"]+")*(?: \w+="[^"]+")*>([^<]*)<\/span>)/g,
          fullAddress = place.adr_address.replace(regexp, "$2");
        this.set('completeAddress', fullAddress);
      } else if (place.formatted_address) {
        this.set('completeAddress', place.formatted_address);
      }

      if (place.geometry && place.geometry.location) {
        this.set('lat', place.geometry.location.lat());
        this.set('lng', place.geometry.location.lng());
        this.set('disableSearch', false);
        var addressComponents = place.address_components;
        addressComponents.forEach((component)=> {
          var componentType = component.types;
          if (componentType[0] === 'country') {
            this.set('selectedCountry', component.long_name);
          }
        });
      }
      this.set('place', place);
    }, prevent(e) {
      e.preventDefault();
      return false;
    },
    addAddressHistory(place) {
      if (!place) {
        return;
      }
      let addressHistory = this.get("addressHistory");
      let comAdd = this.get('completeAddress');
      let isAddressHistoryExist = false;
      addressHistory.forEach(function (d) {
        if (d.formatted_address === place.formatted_address) {
          isAddressHistoryExist = true;
        }
      });
      if (!isAddressHistoryExist) {
        if (addressHistory.length < 4) {
          addressHistory[addressHistory.length] = place;
          this.storage.set("addressHistory", addressHistory);
          this.set("addressHistory", this.storage.get("addressHistory"));
          this.set("showAddressHistory", true);
        } else {
          for (let x = 1; x < 4; x++) {
            addressHistory[x - 1] = addressHistory[x];
          }
          addressHistory[3] = place;
          this.storage.set("addressHistory", addressHistory);
          this.set("addressHistory", this.storage.get("addressHistory"));
        }
      }

    },
    addressHistoryClick(place) {
      Ember.$("#addressHistory").css("display", "none");
      if (Ember.isPresent(place) && place.name === this.get('completeAddress')) {
        return;
      }
      if (place.adr_address) {
        let regexp = /(<span(?: \w+="[^"]+")*(?: \w+="[^"]+")*>([^<]*)<\/span>)/g,
          fullAddress = place.adr_address.replace(regexp, "$2");
        this.set('completeAddress', fullAddress);
      } else if (place.formatted_address) {
        this.set('completeAddress', place.formatted_address);
      }
      if (place.geometry && place.geometry.location) {
        this.set('lat', place.geometry.location.lat);
        this.set('lng', place.geometry.location.lng);
        this.set('disableSearch', false);
        var addressComponents = place.address_components;
        addressComponents.forEach((component)=> {
          var componentType = component.types;
          if (componentType[0] === 'country') {
            this.set('selectedCountry', component.long_name);
          }
        });
      }
    }, closePopup: function () {
      this.set('showAddressPopup', false);
    }
  },
  keyUp: function (e) {
    if (!Ember.$('#addressHistory').find('.pac-item').hasClass("pac-item-selected") && e.keyCode === 40) {
      Ember.$('#addressHistory').find('.pac-item').first().focus();
      Ember.$('#addressHistory').find('.pac-item').first().addClass('pac-item-selected');
    } else if (e.keyCode !== 38) {
      Ember.$('#addressHistory').find('.pac-item-selected').next().focus();
      Ember.$('#addressHistory').find('.pac-item-selected').next().addClass('pac-item-selected').siblings().removeClass('pac-item-selected');
    }

    let inputValue = Ember.$("#googlePlaceContainer").children("div").children('input').val();
    if (inputValue && inputValue.length > 0) {
      Ember.$("#addressHistory").css("display", "none");
    } else {
      Ember.$("#addressHistory").css("display", "block");
    }
    let keyCode = e.keyCode;
    if ((keyCode === 38 || keyCode === 40) && Ember.$("#googlePlaceContainer").children("div").children('input').val() !== '') {
      this.set('ignoreFirst', true);
    }
  },
  keyPress: function (e) {
    let keyCode = e.keyCode;
    if (keyCode === 13) {
      if (e.target.id == "apto") {
        this.send('saveAddress');
      } else {
        let placeToSearch = '';
        let inputValue = Ember.$("#googlePlaceContainer").children("div").children('input').val();
        if (this.get('ignoreFirst')) {
          placeToSearch = this.get('completeAddress');
        } else if (inputValue === "") {
          placeToSearch = Ember.$("#addressHistory").find('.pac-item-selected').text();
        } else {
          placeToSearch = Ember.$(".pac-container .pac-item:first").text();
        }
        Ember.$("#googlePlaceContainer").children("div").children('input').blur();
        if (Ember.isPresent(placeToSearch)) {
          let _this = this;
          var geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({"address": placeToSearch}, function (results, status) {
            if (status === window.google.maps.GeocoderStatus.OK) {
              _this.send('placeChanged', results[0]);
            }
          });
        }
      }

    }
  },
  click: function (e) {

    if (e.target.toString().indexOf('p') == -1 && e.target.toString().indexOf('current-city') == -1) {
      this.set('showCityList', false);
    }
  },
  focusIn: function (e) {
    if (e.target.id == "apto") {

    } else {

    }
  }
});
