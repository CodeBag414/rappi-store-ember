import Ember from 'ember';

export default Ember.Component.extend({
  init() {
    this._super(...arguments);
  },
  didRender() {

    var owl = $("#corridor-" + this.get('corridor').id + "-products");
    if (Ember.$(window).width() < 480) {
      owl.owlCarousel({
          items : 4,
          itemsDesktop : [1000,4],
          itemsDesktopSmall : [900,3],
          itemsTablet: [600,2],
          itemsMobile : [479,2],
          pagination: false,
          navigation: false,
          scrollPerPage: true,
          freeDrag: true
      });
    } else {
      owl.owlCarousel({
          items : 4,
          itemsDesktop : [1000,4],
          itemsDesktopSmall : [900,3],
          itemsTablet: [600,2],
          itemsMobile : [479,2],
          pagination: false,
          navigation: true,
          scrollPerPage: true
      });
    }

  },
  actions: {
    seeAll(route, corridorId, storeId){
      this.sendAction('seeAll', route, corridorId, storeId);
    }
  }
});
