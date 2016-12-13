import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stLat,
  stLng,
  stContent,
  stStoreType,
  stAddressId,
  stAddress,
  stShippingCharges
  } = ENV.storageKeys;

export default Ember.Route.extend({
  init() {
    let content = this.storage.get(stContent);
    if (content !== undefined) {
      this.set('currentCountry', content.countryName);
      if (content.code.toLowerCase() === "mx") {
        this.set("countryBanner", false);
      }
    }
    let lat = this.storage.get(stLat);
    let lng = this.storage.get(stLng);
    if (Ember.isEmpty(lat) && Ember.isEmpty(lng)) {
      if (content !== undefined) {

        let value = content.countryName === 'Colombia' ? 0 : 1;
        let envLoction = ENV.location;
        let location = envLoction[value][envLoction[value].name];
        this.storage.set(stLat, location.lat);
        this.storage.set(stLng, location.lng);

      }
    }

    let category = this.storage.get(stStoreType);
    if (!category) {
      this.storage.set(stStoreType, "express");
    }
  },
  beforeModel(){
    let controller = this.controllerFor('index');
    controller.set("currentlyLoading", true);
    controller.set('showModalAlert', false);
    controller.set('countryCode', 0);
    controller.set('locations', ENV.location);
    let content = this.storage.get(stContent);
    console.log("content>>>", content);
    if (content === undefined || content.currentCountry === undefined) {

      this.apiService.get(`${ENV.currentCountry}`, null)
        .then((data)=> {
          if ((content !== undefined && content.currentCountry !== data.country) && (data.country !== "MX" && data.country !== "CO") && !content.preRender) {
            controller.set('currentCountry', data.country);
            controller.set('showModalAlert', true);
          } else if (content === undefined || (data.country !== content.code && content.currentCountry !== data.country)) {
            this._selectLocation(data.country === "MX" ? 1 : 0);
          }
          controller.set("currentlyLoading", false);
        }).catch((error)=> {
          if (content === undefined) {
            controller.set('showModalAlert', true);
          }
          controller.set("currentlyLoading", false);
          console.log("error", error);
        });
    } else {
      if (content.countryName === "Mexico") {
        this.transitionTo('mexico');
      } else {
        controller.set("currentlyLoading", false);
      }
    }
  },
  _selectLocation: function (value) {
    let controller = this.controllerFor('index');
    console.log("Country: ", (value === 1 ? "MX" : "CO"));
    let session = this.get('session');
    let location = controller.locations[value][controller.locations[value].name];
    controller.set("location", location);
    controller.set("locationIndex", value);
    if (session.get("isAuthenticated")) {
      controller.set('showModalAlert', true);
    } else {
      this.setContent(controller.get("location").lat, controller.get("location").lng, (data)=> {
        controller.set("selectCountryProcess", false);
        if (data !== null) {
          this.storage.set(stLng, null);
          this.storage.set(stLat, null);
          if (session.get("isAuthenticated")) {
            this.logout();
            return;
          }
          window.location.reload(true);
        }
      });
    }
  },
  setContent: function (lat, lng, callback) {
    let controller = this.controllerFor('index');
    this.apiService.get(`${ENV.rappiServerURL}/${ENV.resolveCountry}lat=${lat}&lng=${lng}`, null)
      .then((resp)=> {
        resp.server = resp.server.replace('http://', 'https://');
        resp.countryName = resp.code === 'MX' ? "Mexico" : resp.name;
        this.serverUrl.currentUrl(resp);
        this.serverUrl.setdataByCountry(()=> {
          if (controller.get('currentCountry') !== '') {
            resp.currentCountry = controller.get('currentCountry');
          }
          this.storage.set(stContent, resp);
          callback(resp, null);
        });
      }, (error)=> {
        callback(null, error);
      });
  },
  logout(){
    this.get('session').invalidate();
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
    this._super(controller, model);
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

  },
  model() {

    let lat = this.storage.get(stLat);
    let lng = this.storage.get(stLng);
    let isAuthenticated = this.get('session').get('isAuthenticated');
    if (Ember.isEmpty(lat) && Ember.isEmpty(lng)) {
      window.scrollTo(0, 0);
    }
    if (isAuthenticated && Ember.isPresent(lat) && Ember.isPresent(lng)) {
      if (this.serverUrl.isPayPalENV()) {
        this.transitionTo('paypal.store', ENV.defaultStoreType);
        return;
      }
    }
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
  }, afterModel() {
    this.get('meta').update({
      title: ENV.metaTags.home.title,
      description: ENV.metaTags.home.description
    });
  },
  actions: {
    changeStoreType: function (storeType) {
      let lat = this.storage.get(stLat);
      let lng = this.storage.get(stLng);
      if (Ember.isEmpty(lat) && Ember.isEmpty(lng)) {
        this.controller.set('message', "¡Hey! ¡Pss! Tú, porfa ingresa una dirección válida ☺");
        window.scrollTo(0, 0);
      } else {
        this.controller.set('currentlyLoading', true);
        if (storeType === 'whim') {
          this.transitionTo(this.serverUrl.isPayPalENV() ? 'paypal.whims-and-desires' : 'home.whims-and-desires');
        } else {
          this.transitionTo(this.serverUrl.isPayPalENV() ? 'paypal.store' : 'home.store', storeType);
        }
      }
    },
    goToBurgerDay: function () {
      this.controller.set('currentlyLoading', true);
      this.transitionTo('home.burgerday');
    },
    _selectLocation: function (value) {
      this._selectLocation(value);
    },
    basketOpenned() {
     if (window.location.hash.includes("subcorredor")) {
       this.controllerFor('home.subcorridor').set('basketOpenned', true);
     } else
     if (window.location.hash.includes("corredor")) {
       this.controllerFor('home.corridor').set('basketOpenned', true);
     }
     else if (window.location.hash.includes("whims-and-desires")) {
       this.controllerFor('home.whims-and-desires').set('basketOpenned', true);
     }
     else if (window.location.hash.includes("tienda")) {
       this.controllerFor('home.store.index').set('basketOpenned', true);
     } else {
       this.controller.set('basketOpenned', true);
     }
   },
   loading(transition) {
     let controller = this.controllerFor('home');
     controller.set('currentlyLoading', true);
     transition.promise.finally(function () {
       controller.set('currentlyLoading', false);
     });
   }
  }
});
