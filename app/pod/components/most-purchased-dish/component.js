import Ember from 'ember';

export default Ember.Component.extend({
  init() {
    this._super(...arguments);
  },
  didRender() {
    var owl = $(".most-purchased-products");
    if (Ember.$(window).width() < 480) {
      owl.owlCarousel({
          items : 4,
          itemsDesktop : [1000,4],
          itemsDesktopSmall : [900,3],
          itemsTablet: [600,2],
          itemsMobile : [479, 1.5],
          pagination: false,
          navigation: false,
          scrollPerPage: false
      });
    } else {
      owl.owlCarousel({
          items : 4,
          itemsDesktop : [1000,4],
          itemsDesktopSmall : [900,3],
          itemsTablet: [600,2],
          itemsMobile : [479, 1.5],
          pagination: false,
          navigation: true,
          scrollPerPage: true
      });
    }
  }
});
