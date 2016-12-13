import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
    stLat,
    stLng,
    stContent,
    stStoreType,
    stAddrPopupShown
    } = ENV.storageKeys;

export default Ember.Route.extend({
  serverUrl: Ember.inject.service('server-url'),
  showModalReg: false,
  isLoggedIn: false,
  session: Ember.inject.service('session'),
  url: "",
  init() {
    this._super(...arguments);
    let currentUrl = this.serverUrl.getUrl();
    this.set("url", currentUrl);

  },
  calcTime: function (city, offset) {
    // create Date object for current location
    var d = new Date();

    // convert to msec
    // subtract local time zone offset
    // get UTC time in msec
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);

    // create new Date object for different city
    // using supplied offset
    var nd = new Date(utc + (3600000 * offset));

    // return time as a string
    return nd;
  },
  setupController: function (controller, model) {
    var bogotaTime = this.calcTime('Bogota', '-5');
    if (bogotaTime.getMonth() === 10 && bogotaTime.getDate() === 5) {
      if (bogotaTime.getHours() >= 9 && bogotaTime.getHours() <= 23) {
        controller.set('showBurgerDay', true);
      } else {
        controller.set('showBurgerDay', false);
      }
    } else {
      controller.set('showBurgerDay', false);
    }

    let content = this.storage.get(stContent);
    let lat = this.storage.get(stLat);
    let lng = this.storage.get(stLng);

    let addrPopupShown = this.storage.get(stAddrPopupShown);
    if (!Ember.isPresent(addrPopupShown)) {
      if (this.get('session').get('isAuthenticated')) {
        controller.set('showAddressList', true);
      } else {
        controller.set('showAddressPopup', true);
      }
    }


    if (model) {
      let stores = model.restaurantMenu;

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
          let corridors = storeObj.corridors || [];


          if (Ember.isPresent(corridors) && corridors.length) {
            let newCorridors = [];
            corridors.forEach((codObj)=> {
              codObj.name = codObj.name.toLowerCase().replace(/^\b\w/g, l => l.toUpperCase());
              codObj.rappi_store_id = storeObj.store_id;

              let imageBase = this.serverUrl.getUrl() + `${ENV.rappiWebBaseImage}`;
              codObj.background = imageBase + ENV.rappiWebRestaurantBackgroundImage + codObj.rappi_store_id + ".jpg";
              codObj.logo = imageBase + ENV.rappiWebRestaurantLogoImage + codObj.rappi_store_id + ".png";

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
              newCorridors.push(codObj);
            });
            storeObj.corridors = newCorridors;
            newStores.push(storeObj);
          }
        });
        model.stores = newStores;
      }
      let other = "100_Otros_red";
      corridorsRestaurant.push(other);
      var storesRestaurant = [];

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
          if (model.stores) {
            model.stores.forEach(function (store) {
              store.corridors.forEach(function (corridor) {
                if (corridor.category) {
                  if (corridor.category.indexOf(category) > -1) {
                    storeRestaurant.corridors.push(corridor);
                    storeRestaurant.empty = false;
                  }
                }
              });
            });
          }

          if (!storeRestaurant.empty) {
            countCorridors += storeRestaurant.corridors.length;
            storesRestaurant.push(storeRestaurant);
          }
        }
      });
      storesRestaurant.sort(function (a, b) {
        return a.index - b.index;
      });
      model.restaurantMenu = storesRestaurant;
    }

    controller.set('superMenu', model.superMenu);
    controller.set('expressMenu', model.expressMenu);
    controller.set('restaurantMenu', model.restaurantMenu);
    controller.set('farmaciaMenu', model.farmaciaMenu);
  },
  model() {
    let content = this.storage.get(stContent);
    if (content !== undefined && content.code === "MX") {
      this.transitionTo('download-app');
      return;
    }
    let lat = this.storage.get(stLat);
    let lng = this.storage.get(stLng);
    let currentUrl = this.serverUrl.currentUrl();
    return new Ember.RSVP.Promise(function (resolve, reject) {
      Ember.RSVP.hashSettled({
        superMenu: Ember.$.getJSON(`${currentUrl}api/web/menu/by-location?lat=${lat}&lng=${lng}&store_type=hiper`),
        expressMenu: Ember.$.getJSON(`${currentUrl}api/web/menu/by-location?lat=${lat}&lng=${lng}&store_type=express`),
        restaurantMenu: Ember.$.getJSON(`${currentUrl}api/web/menu/by-location?lat=${lat}&lng=${lng}&store_type=restaurant`),
        farmaciaMenu: Ember.$.getJSON(`${currentUrl}api/web/menu/by-location?lat=${lat}&lng=${lng}&store_type=Farmatodo`)
      }).then(function (hashResult) {
        var objectToResolve = {};

        Object.keys(hashResult).forEach(function (key) {
          if (hashResult[key].state === 'fulfilled') {
            if (key == 'superMenu' || key == 'expressMenu' || key == 'farmaciaMenu') {
              objectToResolve[key] = hashResult[key].value[[Object.keys(hashResult[key].value)[0]]];
            } else {
              objectToResolve[key] = hashResult[key].value;
            }

          } else {
            objectToResolve[key] = [];
          }
        });
        resolve(objectToResolve);
      }).catch(function (error) {
        reject(error);
      });
    });
  },
  actions: {
    showDialog: function () {
      this.toggleProperty('showModalReg');
    }, logout() {
      this.get('session').set('data.cart', null);
      this.get('session').invalidate();
    }, search: function (queryField) {
      if (Ember.isEmpty(queryField)) {
        this.controller.set('searchData', null);
        this.controller.set('productSearched', null);
        this.controller.set('isSearched', false);
        return;
      }
      let currentUrl = this.serverUrl.getUrl();
      Ember.$.getJSON(`${currentUrl}${ENV.productSearch}ids=${queryField.ids}&stores=${queryField.stores}`)
          .then((rsp)=> {
            this.controller.set('searchItems', rsp);
            this.controller.set('searchItemsName', queryField.name);
            this.controller.set('isSearched', true);
          }).fail((err)=> {
            console.log("err>>", err);
          });
    }, changeStoreType: function (storeType) {
      this.controller.set('searchData', null);
      this.controller.set('productSearched', null);
      this.controller.set('isSearched', false);
      this.controller.set('myAccountAccessed', false);
      this.controller.set('cartObject', this.cart.getCart(storeType));
      if (storeType === 'whim') {
        this.transitionTo('home.whims-and-desires');
      } else {
        this.transitionTo('home.store', storeType);
      }
    }, basketOpenned() {
      if (window.location.pathname.includes("subcorredor") || window.location.hash.includes("subcorredor")) {
        this.controllerFor('home.subcorridor').set('basketOpenned', true);
      } else if (window.location.pathname.includes("corredor") || window.location.hash.includes("corredor")) {
        this.controllerFor('home.corridor').set('basketOpenned', true);
      }
      else if (window.location.pathname.includes("whims-and-desires") || window.location.hash.includes("whims-and-desires")) {
        this.controllerFor('home.whims-and-desires').set('basketOpenned', true);
      }
      else if (window.location.pathname.includes("tienda") || window.location.hash.includes("tienda")) {
        this.controllerFor('home.store.index').set('basketOpenned', true);
      } else if (window.location.pathname.includes("restaurant") || window.location.hash.includes("restaurant")) {
        this.controllerFor('home.restaurant').set('basketOpenned', true);
      } else if (window.location.pathname.includes("my-accounts") || window.location.hash.includes("my-accounts")) {
        this.controllerFor('home.my-accounts').set('basketOpenned', true);
      }
      else if (window.location.pathname.includes("place-and-product") || window.location.hash.includes("place-and-product")) {
        this.controllerFor('home.place-and-product').set('basketOpenned', true);
      }
    }
  }
});
