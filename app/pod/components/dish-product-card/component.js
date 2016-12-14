import Ember from 'ember';
import ENV from 'rappi/config/environment';
const {
  stStoreType,
  stStoreId
  } = ENV.storageKeys;

export default Ember.Component.extend({
  serverUrl: Ember.inject.service('server-url'),
  url: "",
  isProductAdded: false,
  isShowingModal: false,
  productInfo: null,
  addedProduct: null,
  quantity: 1,
  init(){
    this._super(...arguments);
    let currentUrl = this.serverUrl.getUrl();
    this.set("url", currentUrl);
    let componentProduct = this.get('product');
    let storeType = this.storage.get(stStoreType);
    let cart = this.cart.getCart(storeType);
    let removedProductId = this.get('removedProductId');
    if (Ember.isPresent(cart) && Ember.isEmpty(removedProductId)) {
      let cartItems = cart.get('cartItems');
      if (Ember.isPresent(cartItems)) {
        cartItems.forEach((itemObj)=> {
          if (itemObj.get('id') === componentProduct.id) {
            this.set('isProductAdded', true);
            this.set('addedProduct', itemObj);
            return;
          }
        });
      }
    }

  },
  willRender(){
    this._super(...arguments);
    let addedProduct = this.get('addedProduct');
    if (Ember.isPresent(addedProduct)) {
      let _this = this;
      addedProduct.on('cartItemRemoved', function () {
        if (_this._state !== 'destroying' && Ember.isPresent(addedProduct)) {
          _this.set('isProductAdded', false);
          _this.set('addedProduct', null);
        }
      });
    }
  },
  actions: {
    toggleModal: function (productInfo) {
      let addedProduct = this.get('addedProduct');
      this.toggleProperty('isShowingModal');
      this.set('productInfo', productInfo);

      mixpanel.track("glance_view", {
        "product_code": productInfo.id,
        "product_name": productInfo.name,
        "add_to_cart": addedProduct ? true : false
      });
    },
    increaseQuantity: function (product) {
      let id = product.id;
      Ember.$(`#span_${id}`).addClass('animated bounceInDown');
      Ember.run.later(this, function () {
        var quantity = parseInt(this.get('quantity'));
        this.set('quantity', quantity + 1);
        Ember.$(`#span_${id}`).removeClass('animated bounceInDown');
      }, 600);

    },
    decreaseQuantity: function(product) {
      let id = product.id;
      Ember.$(`#span_${id}`).addClass('animated bounceOutDown');
      Ember.run.later(this, function () {
        var quantity = parseInt(this.get('quantity'));
        if ( quantity > 1 ) {
          this.set('quantity', quantity - 1);
        }
        Ember.$(`#span_${id}`).removeClass('animated bounceOutDown');
      }, 600);

    },
    addProductToCart: function (product) {
      var quantity = parseInt(this.get('quantity'));
      for (var i = 0; i < quantity; i++ ){
        let id = product.id;
        let name = product.name;
        let price = product.price;
        let presentation = product.presentation;
        let lowImage = product.imagelow ? product.imagelow.replace(this.get('url'), "") : '';
        let image = product.image_low || "uploads/products/high/" + product.image;
        let storeId = product.store_id;
        let saleType = product.sale_type;
        let storeType = this.storage.get(stStoreType);
        let quantity = this.get('quantity');

        let addedProduct = this.cart.pushCart(storeType, {
          id, name, unitPrice: price, image, extras: {presentation, storeId, saleType}
        });

        if (addedProduct.get('quantity') === 1) {
          this.set('isProductAdded', false);
          this.set('isProductAdded', true);
          this.set('addedProduct', addedProduct);
        }
      }

      let storeType = this.storage.get(stStoreType);
      let cart = this.cart.getCart(storeType);
      if (Ember.isEmpty(cart) || Ember.isEmpty(cart.get('lineItems'))) {
        this.sendAction('newCartAdded', this.cart.getCart(storeType));
      }
      mixpanel.track("Global_add_product");
      mixpanel.track("add_to_cart_restaurant");
      if(this.get("inSpecificRestaurant")){
        let restName = "add_in_"+this.get("corridorName");
        mixpanel.track(restName);
      }
    },
    addToCart: function (product) {

      let id = product.id;
      Ember.$(`#span_menu_${id}`).addClass('animated bounceInDown');
      Ember.run.later(this, function () {
        let name = product.name;
        let price = product.price;
        let presentation = product.presentation;
        let lowImage = product.imagelow ? product.imagelow.replace(this.get('url'), "") : '';
        let image = product.image_low || "uploads/products/high/" + product.image;
        let storeId = product.store_id;
        let saleType = product.sale_type;
        let storeType = this.storage.get(stStoreType);

        let addedProduct = this.cart.pushCart(storeType, {
          id, name, unitPrice: price, image, extras: {presentation, storeId, saleType}
        });
        if (addedProduct.get('quantity') === 1) {
          this.set('isProductAdded', false);
          this.set('isProductAdded', true);
          this.set('addedProduct', addedProduct);
        }
        let cart = this.cart.getCart(storeType);
        if (Ember.isEmpty(cart) || Ember.isEmpty(cart.get('lineItems'))) {
          this.sendAction('newCartAdded', this.cart.getCart(storeType));
        }
        mixpanel.track("Global_add_product");
        mixpanel.track("add_to_cart_restaurant");
        if(this.get("inSpecificRestaurant")){
          let restName = "add_in_"+this.get("corridorName");
          mixpanel.track(restName);
        }
        Ember.$(`#span_menu_${id}`).removeClass('animated bounceInDown');
      }, 600);
    }, removeFromCart: function (product) {
      let id = product.id;
      Ember.$(`#span_menu_${id}`).addClass('animated bounceOutDown');
      Ember.run.later(this, function () {
        let storeType = this.storage.get(stStoreType);
        let removedProduct = this.cart.popCart(storeType, {
          id
        });
        if (Ember.isEmpty(removedProduct)) {
          this.set('isProductAdded', false);
          this.set('addedProduct', null);
        }

        Ember.$(`#span_menu_${id}`).removeClass('animated bounceOutDown');
      }, 600);
    }, seeAll(corridorId, storeId){
      this.storage.set(stStoreId, storeId);
      this.get('router').transitionTo('home.subcorridor', corridorId);
    }
  }
});
