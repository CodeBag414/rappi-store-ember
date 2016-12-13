import Ember from 'ember';
import ENV from 'rappi/config/environment';
const {
  paypal
  } = ENV.storageKeys;

export default Ember.Component.extend({
  serverUrl: Ember.inject.service('server-url'),
  showLogin: false,
  showRecoverPassword: false,
  closeButton: true,
  wishMessage: '',
  message: 'ENTREGAMOS CON AMOR',
  urlImage: '',
  facebookAuthActive: false,
  init(){
    this._super(...arguments);
    var m = moment(new Date());
    var hours = m.hours();
    var minute = m.minute();
    if (hours >= 0 && hours <= 11) {
      this.set('wishMessage', 'Buenos días');
      this.set('urlImage', 'url("assets/images/login-modal-day.png")');
    } else if (hours >= 12 && hours < 18) {
      this.set('wishMessage', 'Buenas tardes');
      this.set('urlImage', 'url("assets/images/login-modal-evening.png")');
    } else {
      this.set('wishMessage', 'Buenas noches');
      this.set('urlImage', 'url("assets/images/login-modal-night.png")');
    }
    if (this.get("params") !== undefined || this.storage.get(paypal) !== undefined) {
      this.set("closeButton", false);
    }
  },
  actions: {
    swapPanel: function () {
      this.toggleProperty('showLogin');
    },
    closeLoginPopup: function () {
      Ember.$('body').css('overflow', 'auto');
      this.set('showModalReg', false);
    },
    authenticateWithFacebook() {
      let redirect_uri = window.location.origin + window.location.pathname;

      let currentUrl = this.serverUrl.getUrl();
      if (this.storage.get(paypal) !== undefined) {
        this.set("params", this.storage.get(paypal));
      }
      this.set("facebookAuthActive", true);
      this.get('session').authenticate('authenticator:torii', 'facebook', redirect_uri, currentUrl, this.get("params")).then(()=> {
        this.storage.set(paypal, null);
        this.send("setDataAfterAuthorize");
      });
    }, loggedIn(){
      this.sendAction('loggedIn');
    },
    setDataAfterAuthorize: function () {
      Ember.run.later(this, ()=> {
        let addresses = this.get('session').get('currentAddress');
        if (this.get('session').get('currentUser').get("name") === undefined || Array.isArray(addresses)) {
          this.send('setDataAfterAuthorize');
        } else {
          this.userService.setDataAfterAuthorize(this, addresses);
          var _this = this;
          Ember.run.later(this, ()=> {
            _this.set("facebookAuthActive", false);
          }, 1000);
        }
      });
    }
  }
});
