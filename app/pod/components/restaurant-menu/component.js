import Ember from 'ember';

export default Ember.Component.extend({
  url: "",
  viewMode: "list",
  init() {
    this._super(...arguments);
    let currentUrl = this.serverUrl.getUrl();
    this.set("url", currentUrl);
  },
  didInsertElement() {
    var waypoint = new Waypoint({
      element: document.getElementById('restaurant-menu-container'),
      handler: function(direction) {
        if (direction == "down") {
          Ember.$('.list-view').addClass("fixed");
          Ember.$('.grid-view').addClass("fixed");
          Ember.$('.scroll-progress-bar').fadeIn();
        } else {
          Ember.$('.list-view').removeClass("fixed");
          Ember.$('.grid-view').removeClass("fixed");
          Ember.$('.scroll-progress-bar').fadeOut();
        }
      },
      offset: 130
    });
  },
  didRender() {
    this._super(...arguments);
    let _this = this;

    let wH = $(window).height();
    Ember.$('.scroll-progress-bar').css('height', wH - 130 + 'px');
    let hH = Ember.$('.menu-list').height();
    let top = Ember.$('.menu-list').offset().top - 120;

    Ember.$(window).scroll(function () {
      var scroll = Ember.$(window).scrollTop();
      Ember.$('.progress-line').css('height', (scroll - top) / (hH - wH + 120 + 518) * 100 + '%');

    });
  },
  willDestroyElement() {
    Waypoint.destroyAll();
  },
  actions: {
    switchVideMode: function(mode) {
      this.set('viewMode', mode);
    }
  }
});
