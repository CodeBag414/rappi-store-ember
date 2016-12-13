import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stLat,
  stLng,
  stStoreType
  } = ENV.storageKeys;

export default Ember.Component.extend({
  serverUrl: Ember.inject.service('server-url'),
  loaded: "loading",
  firstTitle: "",
  firstProducts: [],
  secondTitle: "",
  secondProducts: [],
  init() {
    this._super(...arguments);
    this.set("products", []);
  },
  _setCarruselProducts: function functionName() {
    var owl = $(".carrusel-products");
    owl.owlCarousel({
        items : 4,
        itemsDesktop : [1000,4],
        itemsDesktopSmall : [900,3],
        itemsTablet: [600,2],
        itemsMobile : [479,1],
        pagination: false,
        navigation: true,
        scrollPerPage: true
    });
  },
  didRender: function(){
    this._super(...arguments);
    let lat = this.storage.get(stLat);
    let lng = this.storage.get(stLng);

    let currentUrl = this.serverUrl.currentUrl();
    if (this.get("firstProducts").length == 0) {
      Ember.$.getJSON(`${currentUrl}/${ENV.byLocation}?lat=${lat}&lng=${lng}&store_type=web`).then((resp) => {
        this.set("firstTitle", resp[Object.keys(resp)[0]].corridors[0].name);
        this.set("firstProducts", resp[Object.keys(resp)[0]].corridors[0].products);
        this.set("secondTitle", resp[Object.keys(resp)[0]].corridors[1].name);
        this.set("secondProducts", resp[Object.keys(resp)[0]].corridors[1].products);
        this.set("loaded", "loaded");
        Ember.run.later(this, function () {
          this._setCarruselProducts();
        }, 500);
      });
    }
  },
  actions: {
    newCartAdded: function (cart) {

    },
  }
});
