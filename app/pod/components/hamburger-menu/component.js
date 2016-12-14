import Ember from 'ember';

export default Ember.Component.extend({
  showModalReg: false,
  didRender() {
    this._super(...arguments);
    Ember.$(".slide-left-menu").height(Ember.$(window).height());
  },
  init() {
    this._super(...arguments);
    this.set("isWebENV", !this.serverUrl.isPayPalENV());
    var _this = this;
    Ember.$('body').on('click', '.nav-triggered .hamburger-overlay', function (event) {
      if (_this.get("showLeftMenu")) {
        _this.send("hamburgerClose");
      }
    });
  },
  actions: {
    moveToProfile: function () {
      this.send("scrollOnBody");
      this.get('router').transitionTo(this.get('isWebENV') ? 'home.my-accounts.profile' : 'paypal.my-accounts.profile');
    },
    moveToCategories: function () {
      this.send("scrollOnBody");
      this.get('router').transitionTo(this.get('isWebENV') ? 'home.browse-categories' : 'paypal.browse-categories');
    },
    moveToLists: function () {
      this.send("scrollOnBody");
      this.get('router').transitionTo(this.get('isWebENV') ? 'home.my-list.lists' : 'paypal.my-list.lists');
    },
    moveToWhyRappi: function () {
      this.send("scrollOnBody");
      this.get('router').transitionTo(this.get('isWebENV') ? 'home.why-rappy' : 'paypal.why-rappy');
    },
    hamburgerClose: function () {
      this.send("scrollOnBody");
    },
    moveToCreditsCard: function () {
      this.send("scrollOnBody");
      this.transitionTo('home.my-accounts.cards');
    },
    scrollOnBody: function () {
      var container = document.getElementById('container');
      this.set('showLeftMenu', false);
      Ember.$("#nav-icon1").toggleClass('open');
      Ember.$(".wrapper").toggleClass('nav-triggered');
      Ember.$('#container').css('overflow', 'auto');
    },
    toggleCoupon: function () {
      this.send("scrollOnBody");
      this.toggleProperty('showModalCoupon');
    },
    showDialog: function () {
      this.toggleProperty('showLeftMenu');
      Ember.$("#nav-icon1").toggleClass('open');
      Ember.$(".wrapper").toggleClass('nav-triggered');
      this.set('showModalReg', true);
    },
    logout: function () {
      this.get('session').invalidate();
    },goToIndex: function () {
      this.get('router').transitionTo('index');
    }
  }
});
