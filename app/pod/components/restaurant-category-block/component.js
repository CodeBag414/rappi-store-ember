import Ember from 'ember';

export default Ember.Component.extend({
  init() {
    this._super(...arguments);
  },
  didRender() {

    var owl = $("#restaurant-category-" + this.get('category').id);
    owl.owlCarousel({
        items : 3,
        itemsDesktop : [1000,4],
        itemsDesktopSmall : [900,3],
        itemsTablet: [600,2],
        itemsMobile : [479,1],
        pagination: false,
        navigation: true,
        scrollPerPage: true
    });
  },
  actions: {
    seeAll: function(corridorId) {
      this.get('router').transitionTo('home.corridor', corridorId);
    }
  }
});
