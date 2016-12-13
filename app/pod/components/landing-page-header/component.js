import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stLat,
  stLng,
  stContent,
  } = ENV.storageKeys;

export default Ember.Component.extend({
  showModalReg: false,
  showModalAlert: false,
  showPhoneNumberModel: false,
  locations: ENV.location,
  countryCode: 0,
  showAddressListToUpdate: false,
  showAddAddressToUpdate: false,
  currentCountry: '',
  countrySelect: 0,
  countryBanner: true,
  selectCountryProcess: false,
  showAddressList: false,
  showModal: false,
  locationVisible: ENV.locationVisible,
  unSelectedCountry: false,
  init() {
    this._super(...arguments);
    let content = this.storage.get(stContent);
    if (content !== undefined) {
      this.set('currentCountry', content.countryName);
      if (content.code.toLowerCase()=== "mx") {
        this.set("countryBanner", false);
      }
    }

    Ember.$(window).bind('resize', function () {
        var widthDiff = Ember.$(window).width() - Ember.$(".ember-modal-dialog").width();
        var widthDiv = widthDiff / 2;
        var heightDiff = Ember.$(window).height() - Ember.$(".ember-modal-dialog").height();
        var heightDiv = heightDiff / 2;
        Ember.$(".ember-modal-dialog").css({
          left: widthDiv + 'px',
          top: heightDiv + 'px',
          'margin-left': '0',
          'margin-top': '0'
        });
    });
  },
  stores: function () {
    return {
      expressStore: "express",
      restaurantStore: "restaurant",
      farmatodoStore: "farmacia",
      marketStore: this.get('marketStore'),
      superStore: "super"
    };
  }.property('marketStore'),
  didInsertElement(){
    this._super(...arguments);
    let session = this.get('session');
    if (session.get("isAuthenticated")) {
      Ember.run.later(function () {
        Intercom('boot', {
          app_id: ENV.interComAppId,
          name: session.get('currentUser').get('name'),
          email: session.get('currentUser').get('email'),
          created_at: new Date().getTime()
        });
      }, 2000);
    } else {
      Intercom('boot', {
        app_id: ENV.interComAppId,
      });
    }
  },
  actions: {
    showDialog: function () {
      this.toggleProperty('showModalReg');
    },
    closeDialog: function () {
      Ember.$('#comboCountry').val(Ember.$('#comboCountry option:not(:selected)').val());
      this.set('showModalAlert', false);
    },
    showDialogPhone: function () {
      this.toggleProperty('showPhoneNumberModel');
    },
    showDialogPhooneVerify: function () {
      this.toggleProperty('showPhoneNumberVerifyModel');
    },
    logout(){
      this.get('session').invalidate();
    },
    toggleAddressList: function () {
      this.set('showAddressListToUpdate', false);
    }, toggleAddAddress: function () {
      this.set('showAddressList', false);
      this.set('showAddressListToUpdate', false);
      this.toggleProperty('showAddAddressToUpdate');
    },
    switchBWAddressListAddAddress(){
      this.toggleProperty('showAddAddressToUpdate');
      this.toggleProperty('showAddressList');
    },
    changeStoreType: function (storeType) {
      this.sendAction("changeStoreType", storeType);
    },
    countryOption: function () {
      this.set('unSelectedCountry', true);
    },
    selectCountry: function (countryName) {
      let value = countryName === 'colombia' ? 0 : 1;
      let envLoction = ENV.location;
      let location = envLoction[value][envLoction[value].name];
      console.log("location>>>", location);
      let lat = location.lat;
      let lng = location.lng;
      let session = this.get('session');
      this.set('currentlyLoading', true);
      this.apiService.get(`${ENV.rappiServerURL}/${ENV.resolveCountry}lat=${lat}&lng=${lng}`, null)
        .then((resp)=> {
          resp.server = resp.server.replace('http://', 'https://');
          resp.countryName = resp.code === 'MX' ? "Mexico" : resp.name;
          this.serverUrl.currentUrl(resp);
          this.serverUrl.setdataByCountry(()=> {
            if (this.get('currentCountry') !== '') {
              resp.currentCountry = this.get('currentCountry');
            }
            this.storage.set(stContent, resp);
            if (session.get("isAuthenticated")) {
              this.logout();
              return;
            }
            window.location.reload(true);
          });
        }, (error)=> {
          console.log(null, error);
          this.set('currentlyLoading', false);
        });
      this.set('unSelectedCountry', false);
    }
  },
  focusOut: function (e) {
    Ember.run.later(this, function () {
      this.set('unSelectedCountry', false);
    }, 300);
  }
});
