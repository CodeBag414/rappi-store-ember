import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stContent,
  stStoreType,
  stStoreId
  } = ENV.storageKeys;

/** Product pivot id (Coca-cola)*/
const PRODUCT_PIVOTE_ID = '42606';
const PRODUCT_PIVOTE_ID_MX = '10621';

export default Ember.Route.extend({
  serverUrl: Ember.inject.service('server-url'),
  setupController: function (controller, model) {
    this._super(controller, model);
    var storeType = this.storage.get(stStoreType);
    let storeId = this.storage.get(stStoreId);
    if (Ember.isEmpty(storeId)) {
      this.transitionTo('home.store', storeType);
      return;
    }
    controller.set("mobileView", false);
    let storeTypes = {
      'super': 'SUPERMERCADO',
      'express': 'TIENDA EXPRESS',
      'restaurant': 'RESTAURANTES Y CAFÉS',
      'Farmatodo': 'FARMACIA Y BIENESTAR',
      'Antojos y deseos': 'ANTOJOS Y DESEOS'
    };
    controller.set('isRestaurant', storeType === "restaurant");
    if (storeType === "restaurant") {
      let imageBase = `${ENV.rappiServerURL}` + `${ENV.rappiWebBaseImage}`;
      controller.set('background', imageBase + ENV.rappiWebRestaurantBackgroundImage + model.subcorridor.store.store_id + ".jpg");
      controller.set('logo', imageBase + ENV.rappiWebRestaurantLogoImage + model.subcorridor.store.store_id + ".png");

      if (model.subcorridor.store.categories.length > 0) {
        controller.set('categoryName', model.subcorridor.store.categories[0].name);
      } else {
        controller.set('categoryName', '');
      }


      if (model.subcorridor.category_products.length == 0) {
        controller.set('products', []);
      } else {
        let categoryList = ['entradas', 'sopas', 'platos fuertes', 'ensaladas', 'postres'];
        let categoryProducts = model.subcorridor.category_products || [];
        let categoryProductsCopySorted = {};
        let filteredProducts = [];
        let popularProducts = [];
        let bebidasProducts = [];
        categoryProducts.forEach((category)=> {
          let productsObjectForGrid = category;
          let products = category.products || [];
          let productArrayForGrid = [];
          products.forEach((product) => {
            if (product.image !== "NO-IMAGE") {
              filteredProducts.push(product);
              productArrayForGrid.push(product);
              if (product.price > 10000) {
                popularProducts.push(product);
              }
            }
          });
          productsObjectForGrid.products = productArrayForGrid;
          if (Ember.isPresent(productsObjectForGrid.name)) {
            if(productsObjectForGrid.name.toLowerCase() === 'bebidas'){
              bebidasProducts = productsObjectForGrid.products;
            }else{
              categoryProductsCopySorted[productsObjectForGrid.name.toLowerCase()] = productsObjectForGrid;
            }
          } else {
            categoryProductsCopySorted['other'] = productsObjectForGrid;
          }
        });
        var productsByCategoryName = [];
        categoryList.forEach((categoryName)=> {
          if (Ember.isPresent(categoryProductsCopySorted[categoryName])) {
            productsByCategoryName.push(categoryProductsCopySorted[categoryName]);
            delete categoryProductsCopySorted[categoryName];
          }
        });
        if (Ember.isPresent(categoryProductsCopySorted['other'])) {
          productsByCategoryName.push(categoryProductsCopySorted['other']);
          delete categoryProductsCopySorted['other'];
        }
        for (var key in categoryProductsCopySorted) {
          if (categoryProductsCopySorted.hasOwnProperty(key)) {
            productsByCategoryName.push(categoryProductsCopySorted[key]);
          }
        }
        if (Ember.isPresent(popularProducts)) {
          controller.set('dishImage', imageBase + '/products/high/' + popularProducts[0].image);
        }
        controller.set('popularProducts', popularProducts);
        controller.set('bebidasProducts', bebidasProducts);
        controller.set('allProducts', productsByCategoryName);
        controller.set('products', filteredProducts);
      }
    }
    storeType = storeTypes[storeType];
    controller.set("storage", this.storage.get(stContent));
    controller.set('storeTypeName', storeType);
    if (!controller.get('isRestaurant')) {
      this.set('corridorId', model.subcorridor.corridor_id);
      controller.set('backupProducts', model.subcorridor.products);

      var products = model.subcorridor.products;
      products.forEach(function (product, index) {
        var productId = product.id;
        /*** Remove Product pivot */
        if ((productId.split('_')[1] === PRODUCT_PIVOTE_ID || productId.split('_')[1] === PRODUCT_PIVOTE_ID_MX)
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
    }
    window.scrollTo(0, 0);
    Ember.run.schedule('afterRender', this, function () {
      this._setNumOfProducts();
    });
    Ember.$(window).bind('resize', ()=> {
      this._setNumOfProducts();
    });
  },
  _setNumOfProducts() {
    this.controller.set("mobileView", false);
    if (Ember.$(window).width() < 1080) {
      $(".col-product").addClass("product-padding");
      $(".col-product").removeClass("col-product");
    } else {
      $(".product-padding").addClass("col-product");
      $(".product-padding").removeClass("product-padding");
    }

    if (Ember.$(window).width() < 780) {
      this.controller.set("mobileView", true);
    }
  },
  model: function (params) {
    let subcorridorId = params.subcorridor_id;
    this.set('setCorridorId', subcorridorId);
    if (!subcorridorId) {
      return;
    }
    this.set('subcorridorId', subcorridorId);
    let storeType = this.storage.get(stStoreType);
    let currentUrl = this.serverUrl.getUrl();
    if (storeType == "restaurant") {
      return new Ember.RSVP.Promise(function (resolve, reject) {
        var objectToResolve = {};
        Ember.RSVP.hashSettled({
          subcorridor: Ember.$.getJSON(`${currentUrl}api/web/stores/${subcorridorId}/products`)
        }).then(function (hashResult) {
          Object.keys(hashResult).forEach(function (key) {
            if (hashResult[key].state === 'fulfilled') {
              objectToResolve[key] = hashResult[key].value;
            } else {
              objectToResolve[key] = [];
            }
          });
          resolve(objectToResolve);
        }).catch(function (error) {
          reject(error);
        });
      });
    } else {
      return Ember.RSVP.hash({
        subcorridor: Ember.$.getJSON(`${currentUrl}api/web/stores/sub_corridor/${subcorridorId}`)
      });
    }
  },
  afterModel(model) {
    var storeType = this.storage.get(stStoreType);
    if (storeType === "restaurant" && Ember.isEmpty(model.subcorridor)) {
      this.transitionTo('home.store', storeType);
    }
  },
  actions: {
    loading(transition) {
      let controller = this.controllerFor('home');
      let controller1 = this.controllerFor('index');
      controller.set('currentlyLoading', true);
      controller1.set('currentlyLoading', true);
      transition.promise.finally(function () {
        controller.set('currentlyLoading', false);
        controller1.set('currentlyLoading', false);
      });
    },
    change: function () {
      this.controller.set('cartObject', this.cart.getCart(this.storage.get(stStoreType)));
      this.transitionTo('home.store', this.storage.get(stStoreType));
    },
    goToRestaurantHome: function () {
      this.transitionTo('home.store', "restaurant");
    }, back() {
      history.back();
    }
  }
});
