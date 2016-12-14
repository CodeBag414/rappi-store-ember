import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
        stLat,
        stLng,
        stStoreType,
        stContent,
        stAddrPopupShown,
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

    shuffle: function (array) {
        if (array) {
            var copy = [], n = array.length, i;
            // While there remain elements to shuffle…
            while (n) {
                // Pick a remaining element…
                i = Math.floor(Math.random() * n--);
                // And move it to the new array.
                copy.push(array.splice(i, 1)[0]);
            }
            return copy;
        }
        return array;
    },
    setupController: function (controller, model) {
        this._super(controller, model);
        var _this = this;
        let addrPopupShown = this.storage.get(stAddrPopupShown);
        var storeType = this.storage.get(stStoreType);

        if (storeType !== 'ultraservicio') {
            if (!Ember.isPresent(addrPopupShown)) {
                if (this.get('session').get('isAuthenticated')) {
                    this.controllerFor('home').set('showAddressList', true);
                } else {
                    this.controllerFor('home').set('showAddressPopup', true);
                }
            }
        }

        if (Ember.$(window).width() > 480) {
            controller.set('mobileView', false);
        } else {
            controller.set('mobileView', true);
        }


        controller.set("supermarketView", storeType === "super");
        controller.set("expressView", storeType === "express");
        controller.set("pharmacyView", storeType === "farmacia");
        controller.set("restaurantsView", storeType === "restaurant");
        controller.set("restaurantPlatesView", false);

        let currentUrl = this.serverUrl.getUrl();
        controller.set("currentUrl", currentUrl);
        controller.set('storeTypeName', storeType);
        controller.set('storeType', this.get('storeType'));
        controller.set('stLat', this.storage.get(stLat));
        controller.set('stLng', this.storage.get(stLng));

        if (storeType == "restaurant") {
            let stores = model.restaurants.stores;
            let modelPopularStores = model.restaurants.popular_stores || [];
            let modelPopularProducts = model.restaurants.popular_products || [];
            if (Object.prototype.toString.call(stores) === '[object Object]') {
                stores = Ember.$.map(stores, (value)=> {
                    return [value];
                });
            }
            let categories = [];
            stores.forEach((storeList) => {
                categories.push(storeList[0].category);
            });
            controller.set('categories', categories);
            let popular_stores = this.shuffle(modelPopularStores);
            controller.set('popularStores', popular_stores);
            controller.set('allPopularStores', popular_stores);
            var popular_products = [];
            modelPopularProducts.forEach((popular_product) => {
                if (popular_product.image !== "NO-IMAGE") {
                    popular_products.push(popular_product);
                }
            });
            popular_products = this.shuffle(popular_products);

            var recommendedProducts = [];
            popular_products.forEach((product) => {
                if (product.price > 15000) {
                    recommendedProducts.push(product);
                }
            });
            controller.set('mostPurchasedProducts', recommendedProducts.slice(0, 20));
            controller.set('recommendedProducts', recommendedProducts);
            controller.set('allRecommendedProducts', recommendedProducts);

            Ember.run.schedule('afterRender', this, function () {
                if (Ember.$(window).width() < 480) {
                    var owl = $(".restaurant-categories-list");
                    owl.owlCarousel({
                        items: 4,
                        itemsDesktop: [1000, 4],
                        itemsDesktopSmall: [900, 3],
                        itemsTablet: [600, 2],
                        itemsMobile: [479, 4],
                        pagination: false,
                        navigation: false,
                        scrollPerPage: false
                    });
                }
            });
        } else {
            let stores = model.stores;
            let allCorridors = [];
            //some time storage return object and array
            //this condition handle the object type of storage
            if (Object.prototype.toString.call(stores) === '[object Object]') {
                stores = Ember.$.map(stores, (value)=> {
                    return [value];
                });
            }
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
                                    if ((product.id.split('_')[1] === PRODUCT_PIVOTE_ID || productId.split('_')[1] === PRODUCT_PIVOTE_ID_MX) && index === 0) {
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
            controller.set('corridors', allCorridors);
        }

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
    model: function (params) {
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
            this.transitionTo('home.store', ENV.defaultStoreType);
            return;
        } else if (Ember.isEmpty(lat) && Ember.isEmpty(lng)) {
            this.transitionTo('index');
            return;
        }

        this.set('storeType', splittedStores[0]);
        this.storage.set(stStoreType, splittedStores[0]);
        if (splittedStores[0] === 'ultraservicio') {
            this.controllerFor('home').set('storeType', 'restaurant');
        } else {
            this.controllerFor('home').set('storeType', splittedStores[0]);
        }

        this.set('corridors', []);
        storeType = splittedStores[0];
        if (storeType === "farmacia") {
            storeType = "Farmatodo";
        } else if (storeType === ENV.defaultStoreType) {
            storeType = "hiper";
        }
        let result;
        if (storeType == "restaurant") {
            return new Ember.RSVP.Promise(function (resolve, reject) {
                Ember.RSVP.hashSettled({
                    statusApplication: Ember.$.getJSON(`${currentUrl}${ENV.statusApplication}&lat=${lat}&lng=${lng}`),
                    restaurants: Ember.$.getJSON(`${currentUrl}api/web/stores/${storeType}?lat=${lat}&lng=${lng}`)
                }).then(function (hashResult) {
                    var objectToResolve = {};
                    Object.keys(hashResult).forEach(function (key) {
                        if (hashResult[key].state === 'fulfilled') {
                            objectToResolve[key] = hashResult[key].value;
                        } else if (key === 'popularSearch') {
                            objectToResolve[key] = [];
                        } else if (key === 'restaurants') {
                            objectToResolve[key] = {stores: [], popular_stores: [], popular_products: []};
                        } else {
                            reject(hashResult[key]);
                        }
                    });
                    resolve(objectToResolve);
                }).catch(function (error) {
                    reject(error);
                });
            });
        } else {
            return new Ember.RSVP.Promise(function (resolve, reject) {
                var objectToResolve = {};
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
                        } else if (key === 'popularSearch') {
                            objectToResolve[key] = [];
                        } else {
                            reject(hashResult[key]);
                        }
                    });
                    if (Ember.isEmpty(objectToResolve['stores']) && storeType === "hiper") {
                        return Ember.RSVP.hashSettled({
                            stores: Ember.$.getJSON(`${currentUrl}${ENV.byLocation}?lat=${lat}&lng=${lng}&store_type=${ENV.defaultStoreType}`)
                        });
                    } else {
                        resolve(objectToResolve);
                    }
                }).then(function (hashResult) {
                    if (hashResult) {
                        Object.keys(hashResult).forEach(function (key) {
                            if (hashResult[key].state === 'fulfilled') {
                                objectToResolve[key] = hashResult[key].value;
                            } else {
                                reject(hashResult[key]);
                            }
                        });
                    }
                    resolve(objectToResolve);
                }).catch(function (error) {
                    reject(error);
                });
            });
        }
    },
    afterModel() {
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
        if (this.controllerFor('home.store.index').get('redirectToAll')) {
            Ember.run.later(this, function () {
                this.transitionTo('home.store.all', this.get('storeType'));
            }, 500);
        }
        if (this.get('serverUrl').isPayPalENV()) {
            window.history.pushState(null, null, '/#/paypal/tienda/a');
        }
    },
    actions: {
        newCartAdded: function (cart) {
            this.controllerFor('home').send('newCartAdded', cart);
        },
        loading(transition) {
            let controller = this.controllerFor('home');
            controller.set('currentlyLoading', true);
            transition.promise.finally(function () {
                controller.set('currentlyLoading', false);
            });
        },
        seeAll(route, corridorId, storeId) {
            if (this.get('storeType') === "super") {
                mixpanel.track("enter_super_category");
            }
            this.storage.set(stStoreId, storeId);
            this.transitionTo(route, corridorId);
        },
        viewAllRestaurant() {
            this.transitionTo('home.restaurant');
        },
        selectCorridor: function (corridorId) {
            this.transitionTo('home.corridor', corridorId);
        },
        back: function () {
            history.back();
        }
    }
});
