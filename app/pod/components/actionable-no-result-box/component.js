import Ember from 'ember';
import ENV from 'rappi/config/environment';

export default Ember.Component.extend({
  classNames: ['actionable-no-result-box-component'],
  isVisible: false,
  timeVar: null,
  onClickElsewhere: Ember.K,

  setupListener: Ember.on('didRender', function () {
    return $(document).on('click', $.proxy(this.get('onClickElsewhere'), this));
  }),

  removeListener: Ember.on('willDestroyElement', function () {
    return $(document).off('click', $.proxy(this.get('onClickElsewhere'), this));
  }),
  onClickElsewhere: function () {
    this.set('isVisible', false);
  },

  didRender() {
    if (this.get('isHits') > 0) {
      this.set('isVisible', false);
    }
  },
  keywordChanged: Ember.observer('searchKeyword', function () {
    this.set('isVisible', false);
    var _this = this;
    var timeVar = this.get('timeVar');
    clearTimeout(timeVar);
    timeVar = setTimeout(function () {
      let keyword = _this.get('searchKeyword');
      let hitsCount = _this.get('isHits');

      if (keyword && keyword.length > 0 && hitsCount == 0) {
        _this.set('isVisible', true);
      }
    }, 1000);
    this.set('timeVar', timeVar);
  }),

  actions: {
    selectMeaning: function (place_or_product, keyword) {
      this.get('router').transitionTo("home.place-and-product", keyword).then(function (newRoute) {
        if (place_or_product == 'place') {
          newRoute.controller.set('isPlace', true);
        } else {
          newRoute.controller.set('isPlace', false);
        }
      });
      this.set('isVisible', false);
    }
  }
});
