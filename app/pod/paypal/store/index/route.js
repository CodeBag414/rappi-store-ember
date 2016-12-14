import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stLat,
  stLng,
  stStoreType,
  stContent,
  stShippingCharges,
  stStoreId
  } = ENV.storageKeys;

/** Product pivot id (Coca-cola)*/
const PRODUCT_PIVOTE_ID = '42606';
const PRODUCT_PIVOTE_ID_MX = '10621';

export default Ember.Route.extend({
  storage: Ember.inject.service('storage'),
  serverUrl: Ember.inject.service('server-url'),
  storeType: null,
  session: Ember.inject.service('session'),
  _setCarruselProducts: function functionName() {
    var slidesToShow = 5;
    var slidesToScroll = 4;
    if (this.storage.get(stStoreType) === "restaurant") {
      slidesToShow = 3;
      slidesToScroll = 2;
    }
    /** The carousel of products depends on width device */
    $(".carrusel-products").slick({
      dots: false,
      infinite: true,
      arrows: true,
      centerMode: false,
      slidesToShow: this.storage.get(stStoreType) === "restaurant" ? 3 : 5,
      slidesToScroll: this.storage.get(stStoreType) === "restaurant" ? 2 : 4,
      responsive: [
        {
          breakpoint: 2080,
          settings: {
            slidesToShow: this.storage.get(stStoreType) === "restaurant" ? 3 : 5,
            slidesToScroll: this.storage.get(stStoreType) === "restaurant" ? 2 : 4,
            centerMode: false,
            arrows: true
          }
        },
        {
          breakpoint: 1199,
          settings: {
            slidesToShow: this.storage.get(stStoreType) === "restaurant" ? 2 : 5,
            slidesToScroll: this.storage.get(stStoreType) === "restaurant" ? 2 : 4,
            centerMode: false,
            arrows: true
          }
        },
        {
          breakpoint: 1080,
          settings: {
            slidesToShow: this.storage.get(stStoreType) === "restaurant" ? 2 : 3,
            slidesToScroll: this.storage.get(stStoreType) === "restaurant" ? 1 : 2,
            centerMode: false,
            arrows: true
          }
        },
        {
          breakpoint: 780,
          settings: {
            slidesToShow: this.storage.get(stStoreType) === "restaurant" ? 1 : 2,
            slidesToScroll: 1,
            centerMode: this.storage.get(stStoreType) === "restaurant" ? true : false,
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
            slidesToShow: this.storage.get(stStoreType) === "restaurant" ? 1 : 2,
            slidesToScroll: 1,
            arrows: false
          }
        },
      ]
    });
  },
  _setCarruselCategories: function () {
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
    var windowWidth = $(window).width();

    if (windowWidth > 780) {
      Ember.run.later(this, ()=> {
        $(".slick-next").html("<img src='/assets/images/arrow-large-right.svg' width='36' height='37'/>");
        $(".slick-prev").html("<img src='/assets/images/arrow-large-left.svg' width='36' height='37'/>");
      }, 100);
    }

  },
  _setSubMenu: function functionName(routeObj) {
    let currentUrl = this.serverUrl.getUrl();
    let subcorridorIconBase = this.serverUrl.getUrl() + `${ENV.rappiWebBaseImage}` + `${ENV.rappiWebSubcorridorImage}`;
    Ember.$('.carrusel-categories .category').hover(function (e) {
      let storeId = Ember.$(this).attr('store_id');
      var width = $(this).width() + parseFloat($(this).css('marginLeft')) + parseFloat($(this).css('marginRight'));
      var posX = Math.floor((e.pageX - parseFloat($('.carrusel-categories').css('paddingLeft'))) / width) * width + width / 2 + parseFloat($('.carrusel-categories').css('paddingLeft'));
      var posY = $('.carrusel-categories').height();
      var leftWidth = Ember.$(window).width() - posX;
      var className = "align-left";
      if (leftWidth > 510) {
        className = "align-left";
        posX -= 270;
      } else {
        className = "align-right";
        posX -= 510;
      }
      let x = Ember.$('.header-index').outerHeight() + Ember.$('.carousel').outerHeight();
      let Y = Ember.$('.main-menuBar').outerHeight() + Ember.$('.carousel').outerHeight();
      let Z = x - Y;
      if (Ember.$(window).scrollTop() > Z) {
        posY += Ember.$(window).scrollTop() - Ember.$('.main-menuBar').outerHeight();
      }
      Ember.$('.subcategory-menu').css('left', posX + 'px');
      Ember.$('.subcategory-menu').css('top', posY + 'px');
      Ember.$('.subcategory-menu').css('display', 'flex');

      let corridorID = Ember.$(this).attr('id');
      let colors = ["red", "blue", "dark-green", "yellow", "light-green"];
      Ember.$('.subcategory-menu').html('<div class="arrow-top ' + className + '"></div><div class="loader"></div>');
      Ember.$.getJSON(`${currentUrl}api/web/stores/corridor/preview/${corridorID}`).then((resp)=> {
        Ember.$('.subcategory-menu').html('');
        var htmlContent = '<div class="arrow-top ' + className + '"></div>';
        resp.sub_corridors.forEach((subCorridor, index)=> {
          /* remove product has name coca cola and subCorridor has only one product */
          let iconUrl = encodeURI(subcorridorIconBase + subCorridor.icon);
          let color = colors[index % 5];
          if (subCorridor.products.length === 1) {
            subCorridor.products.forEach((product)=> {
              if (product.name.search("Coca Cola") === -1) {
                htmlContent += '<div class="subcorridor-item" id="' + subCorridor.id + '"><div class="subcategory ' + color + '"><div class="subcategory-icon ' + color + '" style="-webkit-mask: url(\'' + iconUrl + '\') no-repeat 50% 50%;mask: url(\'' + iconUrl + '\') no-repeat 50% 50%;"></div></div><p>' + subCorridor.name + '</p></div>';
              }
            });
          } else {
            htmlContent += '<div class="subcorridor-item" id="' + subCorridor.id + '"><div class="subcategory ' + color + '"><div class="subcategory-icon ' + color + '" style="-webkit-mask: url(\'' + iconUrl + '\') no-repeat 50% 50%;mask: url(\'' + iconUrl + '\') no-repeat 50% 50%;"></div></div><p>' + subCorridor.name + '</p></div>';
          }
        });
        Ember.$('.subcategory-menu').html(htmlContent);
        Ember.$('.subcorridor-item').on('click', function () {
          Ember.$('.subcategory-menu').css('display', 'none');
          routeObj.storage.set(stStoreId, storeId);
          routeObj.transitionTo('paypal.subcorridor', Ember.$(this).attr('id'));
        });
      });
    }, function () {

    });
    Ember.$('.subcategory-menu').hover(function (e) {
      Ember.$(this).css('display', 'flex');
    }, function () {
      Ember.$(this).css('display', 'none');
    });
    Ember.$('.carrusel-categories').hover(function (e) {
    }, function () {
      Ember.$('.subcategory-menu').css('display', 'none');
    });
  },

  setupController: function (controller, model) {
    this._super(controller, model);
    var _this = this;

    Ember.run.schedule('afterRender', this, function () {
      _this._setCarruselCategories();
      Ember.run.later(this, function () {
        _this._setCarruselProducts();

      }, 250);
      _this._setSubMenu(_this);
    });
    Ember.$(window).bind('resize', ()=> {
      this._setNumberOfItemCarruselHeader();
    });

    var storeType = this.storage.get(stStoreType);
    controller.set("supermarketView", storeType === "super");
    controller.set("expressView", storeType === "express");
    controller.set("pharmacyView", storeType === "farmacia");
    controller.set("restaurantsView", storeType === "restaurant");
    controller.set("restaurantPlatesView", false);

    let currentUrl = this.serverUrl.getUrl();
    controller.set("currentUrl", currentUrl);
    controller.set('storeTypeName', storeType);
    controller.set('storeType', this.get('storeType'));
    let stores = model.stores;

    let allCorridors = [];
    //some time storage return object and array
    //this condition handle the object type of storage
    if (Object.prototype.toString.call(stores) === '[object Object]') {
      stores = Ember.$.map(stores, (value)=> {
        return [value];
      });
    }

    var corridorsRestaurant = [];
    let content = this.storage.get(stContent);
    let imageBase = this.serverUrl.getUrl() + `${ENV.rappiWebBaseImage}`;

    if (Ember.isPresent(stores) && Array.isArray(stores)) {
      let newStores = [];
      stores.forEach((storeObj)=> {
        let index = storeObj.name.indexOf(".");
        storeObj.name = storeObj.name.substring(index + 1);
        let corridors = storeObj.corridors;
        let addStore = false;

        if (corridors.length) {
          let newCorridors = [];
          corridors.forEach((codObj)=> {
            codObj.name = codObj.name.toLowerCase().replace(/^\b\w/g, l => l.toUpperCase());
            codObj.rappi_store_id = storeObj.store_id;
            if (storeType === "restaurant") {
              let imageBase = this.serverUrl.getUrl() + `${ENV.rappiWebBaseImage}`;
              codObj.background = imageBase + ENV.rappiWebRestaurantBackgroundImage + codObj.store_id + ".jpg";
              codObj.logo = imageBase + ENV.rappiWebRestaurantLogoImage + codObj.store_id + ".png";

              // Si el tipo de tienda es restaurante genera las categorias
              if (codObj.description) {
                let descriptionSplit = codObj.description.split("~");
                if (descriptionSplit.length >= 1) {
                  codObj.description = descriptionSplit.length === 2 ? descriptionSplit[1] : "";
                  codObj.category = descriptionSplit[0].split(",");
                  codObj.category.forEach(function (category) {
                    if (corridorsRestaurant.indexOf(category) === -1) {
                      corridorsRestaurant.push(category);
                    }
                  });
                }
              }
            }

            // Genera el icono y el color para la categoria
            let colorSplit = codObj.description ? codObj.description.split("_") : [];
            codObj.color = colorSplit.length > 1 ? colorSplit[1].split(".")[0] : "";
            codObj.img = imageBase + ENV.rappiWebCorridorImage + codObj.description;

            if (this.get("restaurentId") !== undefined) {
              if (codObj.products.length && codObj.id.toString() === this.get("restaurentId")) {
                let products = codObj.products;
                products.forEach((product)=> {
                  var productId = product.id;
                  product.store_id = storeObj.store_id;
                  /*** Add store id if not found in product id */
                  if (productId.indexOf('_') < 0) {
                    product.id = `${product.store_id}_${productId}`;
                  } else if (productId.split('_')[0] !== product.store_id.toString()) {
                    product.id = `${product.store_id}_${productId.split('_')[1]}`;
                  }
                });
                controller.send("productList", codObj);
                return;
              }
            } else if (codObj.products.length) {
              let products = codObj.products;
              products.forEach((product, index)=> {
                var productId = product.id;
                /*** Remover Product pivot */
                if ((product.id.split('_')[1] === PRODUCT_PIVOTE_ID || productId.split('_')[1] === PRODUCT_PIVOTE_ID_MX)
                  && index === 0) {
                  products.removeObject(product);
                }
                product.store_id = storeObj.store_id;
                /*** Add store id if not found in product id */
                if (product.id.indexOf('_') < 0) {
                  product.id = `${product.store_id}_${product.id}`;
                } else if (productId.split('_')[0] !== product.store_id.toString()) {
                  product.id = `${product.store_id}_${productId.split('_')[1]}`;
                }
              });
              newCorridors.push(codObj);
              allCorridors.push(codObj);
              addStore = true;
            }
          });
          storeObj.corridors = newCorridors;
          if (addStore) {
            newStores.push(storeObj);
          }
        }
      });
      model.stores = newStores;
    }
    let other = "100_Otros_red";
    corridorsRestaurant.push(other);
    var storesRestaurant = [];
    if (this.get('storeType') === "restaurant") {
      //let corridorsRestaurantCount
      let countCorridors = 0;
      corridorsRestaurant.forEach(function (category) {
        let categorySplit = category.split("_");
        if (categorySplit.length === 2) {
          categorySplit = ["100", categorySplit[0], categorySplit[1]];
        }
        if (categorySplit.length === 3) {
          let categoriId = categorySplit[1].replace(/\s/g, '').toLowerCase();
          let color = categorySplit[2];
          var storeRestaurant = {
            index: categorySplit[0],
            id: categoriId,
            name: categorySplit[1].toLowerCase().replace(/^\b\w/g, l => l.toUpperCase()).replace(/-/i, ' '),
            color: color,
            icon: imageBase + ENV.rappiWebRestaurantIconImage + categoriId + "_" + color + ".png",
            corridors: [],
            empty: true
          };
          model.stores.forEach(function (store) {
            store.corridors.forEach(function (corridor) {
              if (corridor.category) {
                if (corridor.category.indexOf(category) > -1) {
                  storeRestaurant.corridors.push(corridor);
                  storeRestaurant.empty = false;
                }
              } else if (category === other) {
                storeRestaurant.corridors.push(corridor);
                storeRestaurant.empty = false;
              }
            });
          });
          if (!storeRestaurant.empty) {
            countCorridors += storeRestaurant.corridors.length;
            storesRestaurant.push(storeRestaurant);
          }
        }
      });
      storesRestaurant.sort(function (a, b) {
        return a.index - b.index;
      });
      let showAllRestaurantHere = countCorridors > 0 && countCorridors <= 10;
      controller.set("showAllRestaurantHere", showAllRestaurantHere);
      model.stores = storesRestaurant;
    }
    this._setCorridorsInController(controller, model.stores);
    let statusApplication = model.statusApplication;
    if (Ember.isPresent(statusApplication)) {
      let marketMinCharge = null;
      let marketPercentageCharge = null;
      let nowMaxCharge = null;
      let countryData = statusApplication['country-data'];
      if (Ember.isPresent(countryData)) {
        countryData.forEach((data)=> {
          if (data.key === "max_charge_value_fast") {
            nowMaxCharge = data.value;
          } else if (data.key === "minimun_charge_value_market") {
            marketMinCharge = data.value;
          } else if (data.key === "percentage_charge_market") {
            marketPercentageCharge = data.value;
          }
          if (Ember.isPresent(nowMaxCharge) && Ember.isPresent(marketMinCharge) && Ember.isPresent(marketPercentageCharge)) {
            return;
          }
        });
        this.storage.set(stShippingCharges, {marketPercentageCharge, marketMinCharge, nowMaxCharge});
      }
    }
    window.scrollTo(0, 0);
  },
  _setCorridorsInController(controller, stores) {
    if (controller.get('storeType') === "restaurant") {
      controller.set('corridors', stores);
    } else {
      let corridors = [];
      stores.forEach((store)=> {
        corridors = corridors.concat(store.corridors)
      })

      controller.set('corridors', corridors);
    }
  },
  model: function (params) {
    this.controllerFor('paypal').set('loadingImg', false);

    let storeType = params.store_id;
    let lat = this.storage.get(stLat);
    let lng = this.storage.get(stLng);
    let currentUrl = this.serverUrl.getUrl();
    let splittedStores = storeType.split(',');
    let redirect = false;

    this.storage.set(stStoreId, null);

    splittedStores.forEach((obj)=> {
      if (ENV.availableStoreTypes.indexOf(obj) < 0) {
        redirect = true;
        return;
      }
    });
    if (redirect) {
      this.transitionTo('paypal.store', ENV.defaultStoreType);
      return;
    } else if (Ember.isEmpty(lat) && Ember.isEmpty(lng)) {
      this.transitionTo('index');
      return;
    }
    this.set('storeType', splittedStores[0]);
    this.storage.set(stStoreType, splittedStores[0]);
    this.set('corridors', []);
    storeType = splittedStores[0];
    if (storeType === "farmacia") {
      storeType = "Farmatodo";
    }
    let result;
    return new Ember.RSVP.Promise(function (resolve, reject) {
      Ember.RSVP.hashSettled({
        statusApplication: Ember.$.getJSON(`${currentUrl}${ENV.statusApplication}&lat=${lat}&lng=${lng}`),
        stores: Ember.$.getJSON(`${currentUrl}${ENV.byLocation}?lat=${lat}&lng=${lng}&store_type=${storeType}`).then((resp)=> {
          result = resp;
          if (splittedStores[1]) {
            return Ember.$.getJSON(`${currentUrl}${ENV.byLocation}?lat=${lat}&lng=${lng}&store_type=${splittedStores[1]}`);
          }
        }).then((resp)=> {
          if (resp) {
            result = result.concat(resp);
          }
          return result;
        })
      }).then(function (hashResult) {
        var objectToResolve = {};
        Object.keys(hashResult).forEach(function (key) {
          if (hashResult[key].state === 'fulfilled') {
            objectToResolve[key] = hashResult[key].value;
          }else {
            reject(hashResult[key]);
          }
        });
        resolve(objectToResolve);
      }).catch(function (error) {
        reject(error);
      });
    });
  }, afterModel() {
    let storeType = this.storage.get(stStoreType);
    let pageLookingFor;
    switch (storeType) {
      case 'super':
        pageLookingFor = 'supermarket';
        break;
      default:
        pageLookingFor = storeType;
    }
    this.get('meta').update({
      title: ENV.metaTags[pageLookingFor].title,
      description: ENV.metaTags[pageLookingFor].description
    });
    if (this.controllerFor('paypal.store.index').get('redirectToAll')) {
      Ember.run.later(this, function () {
        this.transitionTo('paypal.store.all', this.get('storeType'));
      }, 500);
    }
  }, actions: {
    newCartAdded: function (cart) {
      this.controllerFor('paypal').send('newCartAdded', cart);
    }, loading(transition) {
      let controller = this.controllerFor('paypal');
      controller.set('currentlyLoading', true);
      transition.promise.finally(function () {
        controller.set('currentlyLoading', false);
      });
    }, seeAll(route, corridorId, storeId){
        mixpanel.track("enter_paypal");
      this.storage.set(stStoreId, storeId);
      this.transitionTo(route, corridorId);
    }
  }
});
