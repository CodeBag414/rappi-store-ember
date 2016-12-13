import Ember from 'ember';
import ENV from 'rappi/config/environment';
const {
  stStoreType
  } = ENV.storageKeys;
export default Ember.Mixin.create({
  searchMixpanelEvent: function() {
    let storeType  = this.storage.get(stStoreType);
    mixpanel.track("search_complete");
    mixpanel.track(this.get('searchEvents')[storeType]);
  },
  searchEvents: {
    "express": 'express_search',
    "restaurant": 'restaurant_search',
    "farmacia": 'farmacia_search',
    "super": 'super_search'
  },
  openCartEvents :{
    'express': 'open_cart_express',
    'restaurant': 'open_cart_restaurant',
    'farmacia': 'open_cart_farmica',
    'super': 'open_cart_super'
  },
    openCartMixpanelEvent: function() {
      let storeType  = this.storage.get(stStoreType);
      mixpanel.track("open_cart");
      if (window.location.pathname.includes("whims-and-desires") || window.location.hash.includes("whims-and-desires")) {
        mixpanel.track("open_cart_antojos");
      } else {
        mixpanel.track(this.get('openCartEvents')[storeType]);
      }

    },
});
