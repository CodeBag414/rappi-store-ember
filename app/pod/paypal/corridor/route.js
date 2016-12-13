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
  _setCarruselProducts: function functionName() {
    var slidesToShow = 5;
    var slidesToScroll = 4;

    /** The carousel of products depends on width device */
    $(".carrusel-products").slick({
      dots: false,
      infinite: true,
      arrows: true,
      centerMode: false,
      slidesToShow: 5,
      slidesToScroll: 4,
      responsive: [
        {
          breakpoint: 2080,
          settings: {
            slidesToShow: 5,
            slidesToScroll: 4,
            centerMode: false,
            arrows: true
          }
        },
        {
          breakpoint: 1199,
          settings: {
            slidesToShow: 5,
            slidesToScroll: 4,
            centerMode: false,
            arrows: true
          }
        },
        {
          breakpoint: 1080,
          settings: {
            slidesToShow: 3,
            centerMode: false,
            slidesToScroll: 2,
            arrows: true
          }
        },
        {
          breakpoint: 780,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            centerMode: false,
            arrows: false
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            arrows: false
          }
        },
        {
          breakpoint: 270,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            arrows: false
          }
        },
      ]
    });
  },
  _setCarruselCategories: function functionName() {

    $(".carrusel-categories").slick({
      dots: false,
      infinite: true,
      arrows: true,
      slidesToShow: 8,
      slidesToScroll: 7,
      responsive: [
        {
          breakpoint: 2080,
          settings: {
            slidesToShow: 8,
            slidesToScroll: 7,
            centerMode: false,
            arrows: true
          }
        },
        {
          breakpoint: 991,
          settings: {
            slidesToShow: 7,
            slidesToScroll: 5,
            centerMode: false,
            arrows: true
          }
        },
        {
          breakpoint: 770,
          settings: {
            slidesToShow: 7,
            slidesToScroll: 5,
            centerMode: false,
            arrows: true
          }
        },
        {
          breakpoint: 660,
          settings: {
            slidesToShow: 6,
            slidesToScroll: 4,
            centerMode: false,
            arrows: false
          }
        },
        {
          breakpoint: 550,
          settings: {
            slidesToShow: 5,
            slidesToScroll: 3,
            arrows: false
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
            arrows: false
          }
        }
      ]
    });

    Ember.run.later(this, ()=> {
      this._setNumberOfItemCarruselHeader();
    }, 10);
  },
  _setNumberOfItemCarruselHeader: function () {
    var show = Math.round(Ember.$('.carrusel-categories').width() / 110);
    var showItem = Math.round(Ember.$('.carrusel-products').width() / 234);
    $(".carrusel-categories").slick("slickSetOption", 'slidesToShow', show, 'slidesToScroll', (show - 1), 'infinite', true, 'dots', false, "arrows", true);

    if ($(window).width() >= 500) {
      $(".carrusel-products").slick("slickSetOption", 'slidesToShow', showItem, 'slidesToScroll', (showItem - 1));
    } else {
      $(".carrusel-products").slick("slickSetOption", 'slidesToShow', 1, 'slidesToScroll', 1);
    }

    var windowWidth = $(window).width();
    if (windowWidth > 780) {
      this.controller.set("mobileView", false);
      Ember.run.later(this, ()=> {
        $(".slick-next").html("<img src='/assets/images/arrow-large-right.svg' width='36' height='37'/>");
        $(".slick-prev").html("<img src='/assets/images/arrow-large-left.svg' width='36' height='37'/>");
      }, 100);
    } else {
      this.controller.set("mobileView", true);
    }

  },
  setupController: function (controller, model) {
    this._super(controller, model);
    var _this = this;
    var storeType = this.storage.get(stStoreType);
    let storeId = this.storage.get(stStoreId);
    if (Ember.isEmpty(storeId)) {
      this.transitionTo('paypal.store', storeType);
      return;
    }
    controller.set("mobileView", false);
    Ember.run.schedule('afterRender', this, function () {
      _this._setCarruselCategories();
      _this._setCarruselProducts();
    });
    Ember.$(window).bind('resize', ()=> {
      this._setNumberOfItemCarruselHeader();
    });

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
    window.scrollTo(0, 0);
  },
  model: function (params) {
    let corridorId = params.corridor_id;
    if (!corridorId) {
      return;
    }
    this.set('corridorId', corridorId);
    let currentUrl = this.serverUrl.getUrl();
    return Ember.RSVP.hash({
      corridor: Ember.$.getJSON(`${currentUrl}api/web/stores/corridor/preview/${corridorId}`).then((resp)=> {
        if (resp.store.type === "restaurant" && resp.sub_corridors.length > 0) {
          var corridorId = resp.sub_corridors[0].id;
          resp.sub_corridors.forEach(function (corridor) {
            if (corridor.products.length > 0) {
              corridorId = corridor.id;
            }
          });
          this.transitionTo('paypal.subcorridor', corridorId);
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
  },
  actions: {
    loading(transition) {
      let controller = this.controllerFor('paypal');
      controller.set('currentlyLoading', true);
      transition.promise.finally(function () {
        controller.set('currentlyLoading', false);
      });
    },
    change: function () {
      this.controller.set('cartObject', this.cart.getCart(this.storage.get(stStoreType)));
      this.transitionTo('paypal.store', this.storage.get(stStoreType));
    }, showLoginPopUp(){
      this.controllerFor('paypal').set('showLogin', true);
    }
  }
});
