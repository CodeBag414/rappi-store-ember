import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stContent,
  stStoreId
  } = ENV.storageKeys;

export default Ember.Component.extend({
  baseURLImages: "",
  init(){
    this._super(...arguments);
    let currentUrl = this.serverUrl.getUrl();
    this.set("url", currentUrl);
  },
  willRender() {
    this._super(...arguments);
    var _this = this;
    let content = this.storage.get(stContent);
    //_this.set("baseURLImages", (content.code === "MX" ? `${ENV.rappiWebBaseImageMexico}` : `${ENV.rappiWebBaseImageColombia}`) + `${ENV.rappiWebRestaurantImage}`);
    _this.set("baseURLImages", ENV.rappiServerURL + ENV.rappiWebBaseImage);
    var imgRestaurant = _this.get('baseURLImages') + ENV.rappiWebRestaurantBackgroundImage + _this.store.store_id + ".jpg";
    _this.set('imgRestaurant', imgRestaurant);
    var logoRestaurant = _this.get('baseURLImages') + ENV.rappiWebRestaurantLogoImage + _this.store.store_id + ".png";
    _this.set('logoRestaurant', logoRestaurant);
  },
  actions: {
    toggleModal: function (productInfo) {
      this.toggleProperty('isShowingModal');
      this.set('productInfo', productInfo);
    }, productAction: function (data) {
      this.get('router').transitionTo('home.store', "restaurants");
    }, seeAll(route, corridorId, storeId){
      if(this.get("mostPopular")){
        mixpanel.track("enter_los_mas_popular_res");
      }
      this.storage.set(stStoreId, storeId);
      this.get('router').transitionTo(route, corridorId);
    }
  }
})
;
