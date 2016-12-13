import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stLat,
  stLng,
  stContent,
  stStoreType,
  stStoreId,
  stSelectedSubcorridorId
  } = ENV.storageKeys;

/** Product pivot id (Coca-cola)*/
const PRODUCT_PIVOTE_ID = '42606';
const PRODUCT_PIVOTE_ID_MX = '10621';

export default Ember.Route.extend({
  serverUrl: Ember.inject.service('server-url'),
  shuffle: function (array) {
    var copy = [], n = array.length, i;

    // While there remain elements to shuffle…
    while (n) {

      // Pick a remaining element…
      i = Math.floor(Math.random() * n--);

      // And move it to the new array.
      copy.push(array.splice(i, 1)[0]);
    }

    return copy;
  },
  setupController: function (controller, model) {
    this._super(controller, model);
    var _this = this;
    var storeType = this.storage.get(stStoreType);
    let storeId = this.storage.get(stStoreId);
    if (storeType !== "restaurant") {
      if (Ember.isEmpty(storeId)) {
        this.transitionTo('home.store', storeType);
        return;
      }
    }

    controller.set('storeId', storeId);
    controller.set('storeType', storeType);

    let storeTypes = {
      'super': 'SUPERMERCADO',
      'express': 'TIENDA EXPRESS',
      'restaurant': 'RESTAURANTES Y CAFÉS',
      'Farmatodo': 'FARMACIA Y BIENESTAR',
      'Antojos y deseos': 'ANTOJOS Y DESEOS'
    };
    controller.set('showCarrusel', storeType !== "restaurant");
    storeType = storeTypes[storeType];
    controller.set("storage", this.storage.get(stContent));
    controller.set('storeTypeName', storeType);

    if (controller.get('showCarrusel')) {
      let selectedSubcorridorId = this.storage.get(stSelectedSubcorridorId);
      if (Ember.isPresent(selectedSubcorridorId) && selectedSubcorridorId != 0) {
        controller.set('selectedSubcorridorId', selectedSubcorridorId);
        var products = model.subcorridor.products.slice(0, 100);
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
        controller.set('products', products);
        controller.set('loading', false);
        this.storage.set(stSelectedSubcorridorId, 0);

      } else {
        controller.set('selectedSubcorridorId', 0);
      }

      let corridor = model.corridor;
      let subCorridors = corridor.sub_corridors;

      if (subCorridors.length) {
        let newSubCorridors = [];
        subCorridors.forEach((subCodObj)=> {
          if (subCodObj.products.length) {
            newSubCorridors.push(subCodObj);
            var products = subCodObj.products;
            products.forEach(function (product, index) {
              var productId = product.id;
              /*** Remove Product pivot */
              if ((productId.split('_')[1] === PRODUCT_PIVOTE_ID || productId.split('_')[1] === PRODUCT_PIVOTE_ID_MX)
                && index === 0) {
                products.removeObject(product);
              }
              /*** Add store id if not found in product id */
              if (productId.indexOf('_') < 0) {
                product.id = `${storeId}_${productId}`;
              } else if (productId.split('_')[0] !== storeId.toString()) {
                product.id = `${storeId}_${productId.split('_')[1]}`;
              }
            });
          }
        });
        corridor.sub_corridors = newSubCorridors;
      }
      Ember.run.schedule('afterRender', this, function () {
        if (Ember.$(window).width() < 480) {
          var owl = $(".subcategory-container");
          owl.owlCarousel({
              items : 4,
              itemsDesktop : [1000,4],
              itemsDesktopSmall : [900,3],
              itemsTablet: [600,2],
              itemsMobile : [479,4],
              pagination: false,
              navigation: false,
              scrollPerPage: false
          });
        }

      });
    } else {
      let stores = model.restaurants.stores;
      if (stores.length > 0) {
        controller.set('category', stores[0].category);
      }
      controller.set('stores', stores);
      var popular_products = [];
      model.restaurants.popular_products.forEach((popular_product) => {
        if (popular_product.image !== "NO-IMAGE" && popular_product.price > 15000) {
          popular_products.push(popular_product);
        }
      });
      popular_products = this.shuffle(popular_products);
      controller.set('recommendedProducts', popular_products);
    }

    window.scrollTo(0, 0);
  },
  model: function (params) {
    let corridorId = params.corridor_id;
    if (!corridorId) {
      return;
    }
    this.set('corridorId', corridorId);
    let currentUrl = this.serverUrl.getUrl();
    var storeType = this.storage.get(stStoreType);
    if (storeType == "restaurant") {
      let lat = this.storage.get(stLat);
      let lng = this.storage.get(stLng);
      return Ember.RSVP.hash({
        restaurants: Ember.$.getJSON(`${currentUrl}api/web/stores/restaurant/categories/${corridorId}?lng=${lng}&lat=${lat}`)
      });
    } else {
      let selectedSubcorridorId = this.storage.get(stSelectedSubcorridorId);
      if (!Ember.isPresent(selectedSubcorridorId)) {
        selectedSubcorridorId = 0;
      }
      if (selectedSubcorridorId != 0) {
        return Ember.RSVP.hash({
          subcorridor: Ember.$.getJSON(`${currentUrl}api/web/stores/sub_corridor/${selectedSubcorridorId}`),
          corridor: Ember.$.getJSON(`${currentUrl}api/web/stores/corridor/preview/${corridorId}`).then((resp)=> {
            if (resp.store.type === "restaurant" && resp.sub_corridors.length > 0) {
              var corridorId = resp.sub_corridors[0].id;
              resp.sub_corridors.forEach(function (corridor) {
                if (corridor.products.length > 0) {
                  corridorId = corridor.id;
                }
              });
              this.transitionTo('home.subcorridor', corridorId);
            }
            else {
              let response = [];
              response.id = resp.id;
              response.name = resp.name;
              response.icon = resp.icon;
              response.index = resp.index;
              response.type = resp.type;
              response.created_at = resp.created_at;
              response.updated_at = resp.updated_at;
              response.deleted_at = resp.deleted_at;
              response.device = resp.device;
              response.store_id = resp.store_id;
              response.description = resp.description;
              response.subCorridors = resp.subCorridors;

              response.store = resp.store;
              response.sub_corridors = [];
              resp.sub_corridors.forEach((subCorridor)=> {
                /* remove product has name coca cola and subCorridor has only one product */
                if (subCorridor.products.length === 1) {
                  subCorridor.products.forEach((product)=> {
                    if (product.name.search("Coca Cola") === -1) {
                      response.sub_corridors.push(subCorridor);
                    }
                  });
                } else {
                  response.sub_corridors.push(subCorridor);
                }
              });
              return response;
            }
          })
        });
      } else {
        return Ember.RSVP.hash({
          corridor: Ember.$.getJSON(`${currentUrl}api/web/stores/corridor/preview/${corridorId}`).then((resp)=> {
            if (resp.store.type === "restaurant" && resp.sub_corridors.length > 0) {
              var corridorId = resp.sub_corridors[0].id;
              resp.sub_corridors.forEach(function (corridor) {
                if (corridor.products.length > 0) {
                  corridorId = corridor.id;
                }
              });
              this.transitionTo('home.subcorridor', corridorId);
            }
            else {
              let response = [];
              response.id = resp.id;
              response.name = resp.name;
              response.icon = resp.icon;
              response.index = resp.index;
              response.type = resp.type;
              response.created_at = resp.created_at;
              response.updated_at = resp.updated_at;
              response.deleted_at = resp.deleted_at;
              response.device = resp.device;
              response.store_id = resp.store_id;
              response.description = resp.description;
              response.subCorridors = resp.subCorridors;

              response.store = resp.store;
              response.sub_corridors = [];
              resp.sub_corridors.forEach((subCorridor)=> {
                /* remove product has name coca cola and subCorridor has only one product */
                if (subCorridor.products.length === 1) {
                  subCorridor.products.forEach((product)=> {
                    if (product.name.search("Coca Cola") === -1) {
                      response.sub_corridors.push(subCorridor);
                    }
                  });
                } else {
                  response.sub_corridors.push(subCorridor);
                }
              });
              return response;
            }
          })
        });
      }
    }
  },
  actions: {
    loading(transition) {
      let controller = this.controllerFor('home');
      controller.set('currentlyLoading', true);
      let controller1 = this.controllerFor('index');
      controller1.set('currentlyLoading', true);
      transition.promise.finally(function () {
        controller.set('currentlyLoading', false);
        controller1.set('currentlyLoading', false);
      });
    },
    change: function () {
      this.controller.set('cartObject', this.cart.getCart(this.storage.get(stStoreType)));
      this.transitionTo('home.store', this.storage.get(stStoreType));
    }
  }
});
