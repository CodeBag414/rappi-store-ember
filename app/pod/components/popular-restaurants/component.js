import Ember from 'ember';

export default Ember.Component.extend({
  maxShow: 8,
  init() {
    this._super(...arguments);
    if (this.get('stores').length > 8) {
      this.set('maxShow', 8)
    } else {
      this.set('maxShow', this.get('stores').length);
    }
  },
  actions: {
    seeMore: function() {
      let currentMax = this.get('maxShow');
      if (this.get('stores').length - currentMax > 8) {
        this.set('maxShow', currentMax + 8);
      } else {
        this.set('maxShow', this.get('stores').length);
      }
    },
    viewAllRestaurant: function() {
      this.get('router').transitionTo('home.restaurant');
    }
  }
});
