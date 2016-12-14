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

        if (model && model.restaurantMenu) {
            let restaurantMenu = model.restaurantMenu;
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
            var objectToResolve = {};
            Ember.RSVP.hashSettled({
                superMenu: Ember.$.getJSON(`${currentUrl}${ENV.storeMenuUrl}lat=${lat}&lng=${lng}&store_type=hiper`),
                expressMenu: Ember.$.getJSON(`${currentUrl}${ENV.storeMenuUrl}lat=${lat}&lng=${lng}&store_type=express`),
                restaurantMenu: Ember.$.getJSON(`${currentUrl}${ENV.restaurantMenuUrl}lat=${lat}&lng=${lng}`),
                farmaciaMenu: Ember.$.getJSON(`${currentUrl}${ENV.storeMenuUrl}lat=${lat}&lng=${lng}&store_type=Farmatodo`)
            }).then(function (hashResult) {
                Object.keys(hashResult).forEach(function (key) {
                    if (hashResult[key].state === 'fulfilled') {
                        if (key == 'superMenu' || key == 'expressMenu' || key == 'farmaciaMenu') {
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
                    })
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
    actions: {
        showDialog: function () {
            this.toggleProperty('showModalReg');
        },
        logout() {
            this.get('session').set('data.cart', null);
            this.get('session').invalidate();
        },
        search: function (queryField) {
            if (Ember.isEmpty(queryField)) {
                this.controller.set('searchData', null);
                this.controller.set('productSearched', null);
                this.controller.set('isSearched', false);
                return;
            }
            let currentUrl = this.serverUrl.getUrl();
            Ember.$.getJSON(`${currentUrl}${ENV.productSearch}ids=${queryField.ids}&stores=${queryField.stores}`).then((rsp)=> {
                this.controller.set('searchItems', rsp);
                this.controller.set('searchItemsName', queryField.name);
                this.controller.set('isSearched', true);
            }).fail((err)=> {
                console.log("err>>", err);
            });
        },
        changeStoreType: function (storeType) {
            this.controller.set('searchData', null);
            this.controller.set('productSearched', null);
            this.controller.set('isSearched', false);
            this.controller.set('myAccountAccessed', false);
            this.controller.set('cartObject', this.cart.getCart(storeType));
            if (storeType === 'whim') {
                this.transitionTo('home.whims-and-desires');
            } else if (storeType === 'diligencia') {
                this.transitionTo('home.diligence');
            } else {
                this.transitionTo('home.store', storeType);
            }
        },
        basketOpenned() {
            if (window.location.pathname.includes("subcorredor") || window.location.hash.includes("subcorredor")) {
                this.controllerFor('home.subcorridor').set('basketOpenned', true);
            } else if (window.location.pathname.includes("corredor") || window.location.hash.includes("corredor")) {
                this.controllerFor('home.corridor').set('basketOpenned', true);
            } else if (window.location.pathname.includes("whims-and-desires") || window.location.hash.includes("whims-and-desires")) {
                this.controllerFor('home.whims-and-desires').set('basketOpenned', true);
            } else if (window.location.pathname.includes("tienda") || window.location.hash.includes("tienda")) {
                this.controllerFor('home.store.index').set('basketOpenned', true);
            } else if (window.location.pathname.includes("restaurant") || window.location.hash.includes("restaurant")) {
                this.controllerFor('home.restaurant').set('basketOpenned', true);
            } else if (window.location.pathname.includes("my-accounts") || window.location.hash.includes("my-accounts")) {
                this.controllerFor('home.my-accounts').set('basketOpenned', true);
            } else if (window.location.pathname.includes("place-and-product") || window.location.hash.includes("place-and-product")) {
                this.controllerFor('home.place-and-product').set('basketOpenned', true);
            }
        }
    }
});
