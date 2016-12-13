import Ember from 'ember';

/** Product pivot id (Coca-cola)*/
const PRODUCT_PIVOTE_ID = '42606';
const PRODUCT_PIVOTE_ID_MX = '10621';

export default Ember.Controller.extend({
  serverUrl: Ember.inject.service('server-url'),
  url: "",
  isShowingModal: false,
  productInfo: null,
  queryField: '',
  storeType: null,
  lat: null,
  lng: null,
  basketOpenned:false,
  productSearched: null,
  showModalReg: false,
  session: Ember.inject.service('session'),
  selectedSubcorridorId: 0,
  products:[],
  loading: false,
  init(){
    this._super(...arguments);
    Ember.run.later(this, function () {
      let currentUrl = this.serverUrl.getUrl();
      this.set("url", currentUrl);
    }, 50);
  },
  loadProducts: function() {
    let storeId = this.get('storeId');
    let subcorridorId = this.get('selectedSubcorridorId');
    if (subcorridorId != 0) {
      Ember.$.getJSON(`${this.get('url')}api/web/stores/sub_corridor/${subcorridorId}`).then((resp) => {
        var products = resp.products.slice(0, 100);
        products.forEach(function (product, index) {
          var productId = product.id;
          /*** Remove Product pivot */
          if ( (productId.split('_')[1] === PRODUCT_PIVOTE_ID || productId.split('_')[1] === PRODUCT_PIVOTE_ID_MX)
              && index === 0) {
            products.removeObject(product);
          }
          product.store_id = storeId;
          /*** Add store id if not found in product id */
          if (productId.indexOf('_') < 0) {
            product.id = `${storeId}_${productId}`;
          } else if (productId.split('_')[0] !== storeId.toString()) {
            product.id = `${storeId}_${productId.split('_')[1]}`;
          }
        });
        this.set('products', products);
        this.set('loading', false);
      });
    }
  },
  actions: {
    toggleModal: function (productInfo) {
      this.toggleProperty('isShowingModal');
      this.set('productInfo', productInfo);
    }, showDialog: function () {
      this.toggleProperty('showModalReg');
    }, logout(){
      this.get('session').invalidate();
    }, click: function () {
      Ember.$('#product-basket').collapse('hide');
      this.set('overflow', false);
      Ember.$("body").css("overflow", "auto");
    }, selectSubcorridor: function (subcorridorId) {
      this.set('selectedSubcorridorId', subcorridorId);
      this.set('products', []);
      if (subcorridorId != 0) {
        this.set('loading', true);
      } else {
        this.set('loading', false);
      }
      Ember.run.later(this, function () {
        this.loadProducts();
      }, 500);
    }
  }
});
