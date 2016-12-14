import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
        stLat,
        stLng,
        stContent,
        stStoreType,
        stShowPromoBanner
    } = ENV.storageKeys;

export default Ember.Route.extend({
    serverUrl: Ember.inject.service('server-url'),
    flashMessages: Ember.inject.service(),
    page: 1,
    perPage: 5,
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
            this.storage.set(stStoreType, "restaurant");
        }
        this.storage.set(stShowPromoBanner,false);
    },
    beforeModel() {
        let controller = this.controllerFor('index');
        controller.set("currentlyLoading", true);
        controller.set('showModalAlert', false);
        controller.set('countryCode', 0);
        controller.set('locations', ENV.location);
        let content = this.storage.get(stContent);
        console.log("content>>>", content);
        if (content === undefined || content.currentCountry === undefined) {
            this.apiService.get(`${ENV.currentCountry}`, null).then((data)=> {
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
        this.apiService.get(`${ENV.rappiServerURL}/${ENV.resolveCountry}lat=${lat}&lng=${lng}`, null).then((resp)=> {
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
    logout() {
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

        if (model && model.restaurantMenu) {
            let restaurantMenu = model.restaurantMenu || [];
            //some time storage return object and array
            //this condition handle the object type of storage
            if (Object.prototype.toString.call(restaurantMenu) === '[object Object]') {
                restaurantMenu = Ember.$.map(restaurantMenu, (value)=> {
                    return [value];
                });
            }
            restaurantMenu.forEach((obj)=> {
                if (obj.name.toLowerCase() === 'restaurant') {
                    model.restaurantMenu = obj.categories;
                }
            });
        }

        if (Ember.isPresent(model) && Ember.isPresent(model.whims)) {
            let whims = model.whims;
            let updatedWhims = [];
            whims.forEach((whim)=> {
                let splitedData = whim.text.split('&whim&');
                updatedWhims.pushObject({
                    text: whim.text,
                    what: splitedData[0],
                    where: splitedData[1],
                    created: whim.created_at,
                    buttonText: "+ agregar a la canasta"
                });
            });
            model.whims = updatedWhims;
        }
        window.scrollTo(0, 0);
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
        var accessToken = this.get('session').get('data.authenticated.access_token');
        let _this = this;
        return new Ember.RSVP.Promise(function (resolve, reject) {
            var objectToResolve = {};
            Ember.RSVP.hashSettled({
                superMenu: Ember.$.getJSON(`${currentUrl}${ENV.storeMenuUrl}lat=${lat}&lng=${lng}&store_type=hiper`),
                expressMenu: Ember.$.getJSON(`${currentUrl}${ENV.storeMenuUrl}lat=${lat}&lng=${lng}&store_type=express`),
                restaurantMenu: Ember.$.getJSON(`${currentUrl}${ENV.restaurantMenuUrl}lat=${lat}&lng=${lng}`),
                farmaciaMenu: Ember.$.getJSON(`${currentUrl}${ENV.storeMenuUrl}lat=${lat}&lng=${lng}&store_type=Farmatodo`),
                whims: Ember.$.ajax({
                  type: "GET",
                  headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                  },
                  dataType: 'json',
                  url: `${currentUrl}/${ENV.whimList}?page=${_this.get('page')}&per_page=${_this.get('perPage')}`,
                })
            }).then(function (hashResult) {
                Object.keys(hashResult).forEach(function (key) {
                    if (hashResult[key].state === 'fulfilled') {
                        if (key === 'superMenu' || key === 'expressMenu' || key === 'farmaciaMenu') {
                            objectToResolve[key] = hashResult[key].value[[Object.keys(hashResult[key].value)[0]]];
                        } else {
                            objectToResolve[key] = hashResult[key].value;
                        }
                    } else if (key === 'restaurantMenu') {
                        objectToResolve[key] = [{name: 'restaurant', categories: []}];
                    } else {
                        objectToResolve[key] = [];
                    }
                });
                if (Ember.isEmpty(objectToResolve['superMenu'])) {
                    return Ember.RSVP.hashSettled({
                        superMenu: Ember.$.getJSON(`${currentUrl}api/web/menu/by-location?lat=${lat}&lng=${lng}&store_type=${ENV.defaultStoreType}`)
                    });
                } else {
                    resolve(objectToResolve);
                }
            }).then(function (hashResult) {
                if (hashResult) {
                    Object.keys(hashResult).forEach(function (key) {
                        if (hashResult[key].state === 'fulfilled') {
                            objectToResolve[key] = hashResult[key].value[[Object.keys(hashResult[key].value)[0]]];
                        } else {
                            objectToResolve[key] = [];
                        }
                    });
                }
                resolve(objectToResolve);
            }).catch(function (error) {
                reject(error);
            });
        });
    },
    afterModel() {
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
                } else if (storeType === 'diligencia') {
                    this.transitionTo('home.diligence');
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
            } else if (window.location.hash.includes("corredor")) {
                this.controllerFor('home.corridor').set('basketOpenned', true);
            } else if (window.location.hash.includes("whims-and-desires")) {
                this.controllerFor('home.whims-and-desires').set('basketOpenned', true);
            } else if (window.location.hash.includes("tienda")) {
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
        },
        scrollEnd(){
            let controller = this.get('controller');
            if (!controller.get('loading') && !controller.get('noMoreWhims')) {
                this.incrementProperty('page');
                controller.toggleProperty('loading');
                this.send('refreshModel');
            }
        },
        refreshModel() {
            var accessToken = this.get('session').get('data.authenticated.access_token');
            let currentUrl = this.serverUrl.getUrl();
            let route = this;
            let controller = this.get('controller');
            this.apiService.get(`${currentUrl}/${ENV.whimList}?page=${this.get('page')}&per_page=${this.get('perPage')}`, accessToken).then(function (data) {
                let model = route.get('controller').get('model');
                route.get('controller');
                if (Ember.isPresent(model) && Ember.isPresent(model.whims) && Ember.isPresent(data)) {
                    let whims = model.whims;
                    let updatedWhims = [];
                    data.forEach((whim)=> {
                        let splitedData = whim.text.split('&whim&');
                        updatedWhims.pushObject({
                            text: whim.text,
                            what: splitedData[0],
                            where: splitedData[1],
                            created: whim.created_at,
                            buttonText: "+ agregar a la canasta"
                        });
                    });
                    Ember.set(model, 'whims', whims.concat(updatedWhims));
                } else if (Ember.isEmpty(data)) {
                    controller.toggleProperty('noMoreWhims');
                }
                controller.toggleProperty('loading');
                route.get('controller').set('model', model);
            }).catch((err)=> {
                controller.toggleProperty('loading');
                let errMsg = `${err.statusText}: `;
                if (Ember.isPresent(err.responseJSON) && Ember.isPresent(err.responseJSON.errors)) {
                    let errors = err.responseJSON.errors;
                    Object.keys(errors).forEach((errKey)=> {
                        errMsg += ', ' + errors[errKey][0];
                    })
                }
                this.get('flashMessages').danger(errMsg);
            });
        }
    }
});
