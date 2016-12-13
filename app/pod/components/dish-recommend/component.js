import Ember from 'ember';

export default Ember.Component.extend({
  url: "",
  init() {
    this._super(...arguments);
    let currentUrl = this.serverUrl.getUrl();
    this.set("url", currentUrl);
  },
  didRender() {
    this._super(...arguments);
    let _this = this;
    let wH = $(window).height();
    let hH = Ember.$('.dish-recommend-container').outerHeight();
    Ember.$(window).scroll(function () {
      var scroll = Ember.$(window).scrollTop();
      if (Ember.isPresent(Ember.$('.dish-recommend-container'))) {
        if (scroll > Ember.$('.dish-recommend-container').offset().top) {
          Ember.$('.recommend-product-container').css('transform', 'translateY(-' + (scroll - Ember.$('.dish-recommend-container').offset().top) / 20 + 'px)');
        }
      }
    });
  }
});
