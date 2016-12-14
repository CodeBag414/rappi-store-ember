import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stLat,
  stLng,
  stAddress,
  stCity,
  stContent,
  stStoreType,
  stShippingCharges,
  stAddressId,
  stStoreId,
  stSelectedSubcorridorId,
  stShowPromoBanner
  } = ENV.storageKeys;

export default Ember.Component.extend({
    showModalReg: false,
    showModalAlert: false,
    showPhoneNumberModel: false,
    locations: ENV.location,
    countryCode: 0,
    showAddressListToUpdate: false,
    showAddAddressToUpdate: false,
    currentCountry: '',
    countrySelect: 0,
    countryBanner: true,
    selectCountryProcess: false,
    showAddressList: false,
    showModal: false,
    locationVisible: ENV.locationVisible,
    unSelectedCountry: false,
    showSearchCategoryMenu: false,
    currentCateogry: 'Todos',
    currentType: null,
    hits: [],
    restaurants: [],
    algoliaFilters: "",
    onHoverBindedOnNav: false,
    addressListOpen: false,
    showAddressPopup: false,
    flow: null,
    store: Ember.inject.service(),
    updateCartAddress: Ember.observer('session.isAuthenticated', function(){
        this.getAddresses();
    }),
    fetching: false,
    init() {
        this._super(...arguments);

        let content = this.storage.get(stContent);
        if (content !== undefined) {
            this.set('currentCountry', content.countryName);
            if (content.code.toLowerCase() === "mx") {
                this.set("countryBanner", false);
            }
        }
        this.getAddresses();

        let category = this.storage.get(stStoreType);
        if (category === "super") {
            this.set('currentCateogry', 'Supermercado');
        } else if (category === 'express') {
            this.set('currentCateogry', 'Tienda Express');
        } else if (category === 'restaurant') {
            this.set('currentCateogry', 'Restaurantes');
        } else if (category === 'farmacia') {
            this.set('currentCateogry', 'Farmacia');
        } else if (category === 'rappicode') {
            this.set('currentCateogry', 'RappiCode');
        } else {
            this.set('currentCateogry', 'Todos');
        }
        if (category !== 'rappicode') {
            this.setSearchFilter();
        }

        Ember.$(window).bind('resize', function () {
            var widthDiff = Ember.$(window).width() - Ember.$(".ember-modal-dialog").width();
            var widthDiv = widthDiff / 2;
            var heightDiff = Ember.$(window).height() - Ember.$(".ember-modal-dialog").height();
            var heightDiv = heightDiff / 2;
            Ember.$(".ember-modal-dialog").css({
                left: widthDiv + 'px',
                top: heightDiv + 'px',
                'margin-left': '0',
                'margin-top': '0'
            });
        });

        var _this = this;
        Ember.$('body').on('click', function (event) {
            if (event.target.className !== 'bg' && event.target.className !== 'OFICINA' && event.target.className !== 'CALLE-93-18-51' &&
            event.target.className !== 'arrow-height') {
                Ember.$('#addressListPopupAfterLogin').css('display', 'none');
                Ember.$('#addressListPopup').css('display', 'none');
                if (_this._state !== 'destroying') {
                    _this.set('addressListOpen', false);
                }
            }
        });
    },
    getAddresses: function () {
        let completeAddress = this.storage.get(stAddress);
        this.set('cartAddress', completeAddress);
        this.set('storageAddress', this.storage.get(stAddress));
        this.set('storageCity', this.storage.get(stCity));
        var store = this.get('store');
        if(this.get('session').get('isAuthenticated')) {
            store.findAll('address').then((addresses) => {
                this.set('addresses', addresses);
                addresses.forEach((data)=> {
                    if (data.get('active')) {
                        this.set('activeAddress', data);
                        return;
                    }
                });
            });
        }
    },
    stores: function () {
        return {
            expressStore: "express",
            restaurantStore: "restaurant",
            farmatodoStore: "farmacia",
            marketStore: this.get('marketStore'),
            superStore: "super"
        };
    }.property('marketStore'),
    setSearchFilter: function () {
        let currentUrl = this.serverUrl.getUrl();
        var latitude = this.storage.get(stLat);
        var longitude = this.storage.get(stLng);
        var store_types = this.storage.get(stStoreType);
        if (store_types === "farmacia") {
            store_types = "Farmatodo";
        }

        if (this.get("currentType") === null || store_types !== this.get("currentType")) {
            this.set("hits", []);
            this.set("restaurants", []);
            this.set("currentType", store_types);
            var stores = [];
            let url = `${currentUrl}${ENV.storage}lat=${latitude}&lng=${longitude}&store_types=${store_types}`;
            Ember.$.ajax({
                type: "GET",
                url: url,
            }).then((rsp)=> {
                let filterString = "";
                for (var key in rsp.stores) {
                    if (rsp.stores[key].store_id > 0) {
                        filterString += rsp.stores[key].store_id.toString() + " OR ";
                    }
                }
                filterString = filterString.substr(0, filterString.lastIndexOf(" OR "));
                this.set("algoliaFilters", filterString);
            }).fail((err)=> {
                console.info("err>> is ...", err);
                this.set("algoliaFilters", "");
            });
        }
    },
    willRender() {
        this._super(...arguments);
        let currentUrl = this.serverUrl.getUrl();
        let storeType = this.storage.get(stStoreType);
        let cartObj = this.get('cartObject');
        this.set('storageAddress', this.storage.get(stAddress));
        this.set('storageCity', this.storage.get(stCity));
        this.getAddresses();
        if (Ember.isEmpty(cartObj) && Ember.isEmpty(storeType)) {
            cartObj = this.cart.getCart('whim');
            if (Ember.isEmpty(cartObj)) {
                cartObj = this.cart.createCart('whim');
                this.set('cartObject', cartObj);
            }
        } else if (Ember.isEmpty(cartObj) || (Ember.isPresent(storeType) && cartObj.get('name') !== storeType)) {
            cartObj = this.cart.getCart(storeType);
            if (Ember.isEmpty(cartObj)) {
                let completeAddress = this.storage.get(stAddress);
                let latitude = this.storage.get(stLat);
                let longitude = this.storage.get(stLng);
                let addressId = this.storage.get(stAddressId);
                let shippingAddress = {
                    id: addressId || 0,
                    address: completeAddress,
                    lat: latitude,
                    lng: longitude
                };
                cartObj = this.cart.createCart(storeType, this.storage.get(stShippingCharges), shippingAddress);
            }
            this.set('cartObject', cartObj);
        }

        if (this._state !== 'destroying' && Ember.isPresent(cartObj)) {
            cartObj.on('itemPushed', function () {
                Ember.$('#productMSG').stop(true, true).delay(200).fadeIn(500);
                if (cartObj.get('totalItems') === 1) {
                    Ember.$('#cartPTAG').text("Producto en la ");
                } else {
                    Ember.$('#cartPTAG').text("Productos en tu ");
                }
                Ember.run.later(function () {
                    Ember.$('#productMSG').stop(true, true).delay(200).fadeOut(500);
                }, 3000);
            });

            cartObj.on('itemPoped', function () {
                Ember.$('#cartPTAG').text("Producto removido de la ");
                Ember.$('#productMSG').stop(true, true).delay(200).fadeIn(500);
                Ember.run.later(function () {
                    Ember.$('#productMSG').stop(true, true).delay(200).fadeOut(500);
                }, 3000);
            });

            cartObj.on('whimPushed', function () {
                Ember.$('#whimMSG').stop(true, true).delay(200).fadeIn(500);
                Ember.run.later(function () {
                    Ember.$('#whimMSG').stop(true, true).delay(200).fadeOut(500);
                }, 3000);
            });

            let _this = this;
            cartObj.on('cartRemoved', function () {
                _this.set('cartObject', null);
            });
        }

        var latitude = this.storage.get(stLat);
        var longitude = this.storage.get(stLng);
        var store_types = this.storage.get(stStoreType);
        if (store_types === "farmacia") {
            store_types = "Farmatodo";
        }
        if (this.get("currentType") === null || store_types !== this.get("currentType")) {
            this.set("hits", []);
            this.set("currentType", store_types);
            var stores = [];
            let url = `${currentUrl}${ENV.storage}lat=${latitude}&lng=${longitude}&store_types=${store_types}`;
            Ember.$.ajax({
                type: "GET",
                url: url,
            }).then((rsp)=> {
                let filterString = "";
                for (var key in rsp.stores) {
                    if (rsp.stores[key].store_id > 0) {
                        filterString += rsp.stores[key].store_id.toString() + " OR ";
                    }
                }
                filterString = filterString.substr(0, filterString.lastIndexOf(" OR "));
                this.set("algoliaFilters", filterString);
            }).fail((err)=> {
                console.info("err>> is ...", err);
            });
        }
    },
    didRender() {
        this._super(...arguments);
        let _this = this;
        Ember.$(window).scroll(function () {
            var scroll = Ember.$(window).scrollTop();
            if (Ember.$(window).width() < 481) {
                return;
            }
            if (scroll > 264) {
                Ember.$('.menu-container').addClass('fixed');
                Ember.$('.explore-sections').addClass('fixed');
                Ember.$(".menu-container").css({"margin-top": "0px"});
            } else {
                Ember.$('.menu-container').removeClass('fixed');
                Ember.$('.explore-sections').removeClass('fixed');
                if ( _this.storage.get(stShowPromoBanner)) {
                    Ember.$(".menu-container").css({"margin-top": "396px"});
                } else {
                    Ember.$(".menu-container").css({"margin-top": "334px"});
                }
            }
            if (scroll > 10) {
                Ember.$('.header-bar').css('visibility', 'visible');
            } else {
                Ember.$('.header-bar').css('visibility', 'hidden');
            }

            Ember.$('.header-bar').css('opacity', Math.pow(scroll / 264, 7));
            Ember.$('#productMSG').stop(true, true).delay(200).fadeOut(1000);

        });

        Ember.$('.basket li.dropdown').hover(function () {
            if (_this.get('cartObject.totalItems') === 1) {
                Ember.$('#cartPTAG').text("Producto en la ");
            } else {
                Ember.$('#cartPTAG').text("Productos en tu ");
            }

            Ember.$('#productMSG').stop(true, true).delay(200).fadeIn(500);
        }, function () {
            Ember.$('#productMSG').stop(true, true).delay(200).fadeOut(500);
        });
        if (!this.get("onHoverBindedOnNav")) {
            this.set("onHoverBindedOnNav", true);
            Ember.$(".navigation-bar").hover(function () {
                mixpanel.track("hover_dropdown_menu");
            }, function () {
            });
            if (Ember.isEmpty(this.storage.get(stShowPromoBanner)) || this.storage.get(stShowPromoBanner)) {
                Ember.$(".menu-container").css({"margin-top": "396px"});
            }
        }
    },
    didInsertElement: function () {
        var $menu = $(".category-menu");
        $menu.menuAim({
            activate: this.activateSubmenu,
            deactivate: this.deactivateSubmenu
        });
        var setTimeoutConst;
        Ember.$(".navigation-item").hover(function () {
            var navItem = $(this);
            setTimeoutConst = setTimeout(function () {
                navItem.addClass("active");
            }, 300);
        }, function () {
            clearTimeout(setTimeoutConst);
            Ember.$(".navigation-item").removeClass("active");
            Ember.$(".main-subcategory-menu").css("display", "none");
        });
    },
    activateSubmenu: function (row) {
        var $row = $(row),
            submenuId = $row.data("submenuId"),
            $submenu = $("#" + submenuId);

        $submenu.css({
            display: "block"
        });
    },
    deactivateSubmenu: function (row) {
        var $row = $(row),
            submenuId = $row.data("submenuId"),
            $submenu = $("#" + submenuId);
        $submenu.css("display", "none");
    },
    actions: {
        goToRestaurant: function (restaurantId) {
            this.set("hits", []);
            this.set("restaurants", []);
            this.set('currentlyLoading', true);
            this.storage.set(stStoreId, restaurantId);
            this.get('router').transitionTo('home.subcorridor', restaurantId);
        },
        selectMeaning: function (place_or_product, keyword) {
            this.set("hits", []);
            this.set("restaurants", []);
            this.set('currentlyLoading', true);
            this.get('router').transitionTo("home.place-and-product", keyword).then(function (newRoute) {
                if (place_or_product == 'place') {
                    newRoute.controller.set('isPlace', true);
                } else {
                    newRoute.controller.set('isPlace', false);
                }
            });
        },
        goToRestaurantCategory: function (categoryId) {
            Ember.$(".navigation-item").removeClass("active");
            Ember.$(".main-subcategory-menu").css("display", "none");
            this.storage.set(stStoreType, 'restaurant');
            this.get('router').transitionTo('home.corridor', categoryId);
        },
        showDialog: function () {
            this.toggleProperty('showAddressPopup');
            this.toggleProperty('showModalReg');
        },
        closeDialog: function () {
            Ember.$('#comboCountry').val(Ember.$('#comboCountry option:not(:selected)').val());
            this.set('showModalAlert', false);
        },
        showDialogPhone: function () {
            this.toggleProperty('showPhoneNumberModel');
        },
        showDialogPhooneVerify: function () {
            this.toggleProperty('showPhoneNumberVerifyModel');
        },
        showSearchCategoryMenu: function () {
            this.toggleProperty('showSearchCategoryMenu');
        },
        logout() {
            this.get('session').invalidate();
        },
        toggleAddressList: function () {
            this.set('showAddressListToUpdate', false);
        },
        toggleAddAddress: function () {
            this.set('showAddressList', false);
            this.set('showAddressListToUpdate', false);
            this.toggleProperty('showAddAddressToUpdate');
        },
        changeStoreType: function (storeType) {
            this.sendAction("changeStoreType", storeType);
        },
        countryOption: function () {
            this.set('unSelectedCountry', true);
        },
        selectSearchCategory: function (category) {
            this.toggleProperty('showSearchCategoryMenu');
            if (category === "todos") {
                this.storage.set(stStoreType, null);
            } else if (category !== "whim") {
                this.storage.set(stStoreType, category);
            }
            Ember.$('#headerProductSearchField').attr("placeholder", "¿Qué estás buscando?");
            if (category === "super") {
                this.set('currentCateogry', 'Supermercado');
            } else if (category === 'express') {
                this.set('currentCateogry', 'Tienda Express');
            } else if (category === 'restaurant') {
                this.set('currentCateogry', 'Restaurantes');
            } else if (category === 'farmacia') {
                this.set('currentCateogry', 'Farmacia');
            } else if (category === 'whim') {
                this.set('currentCateogry', 'Antojos');
            } else if (category === 'rappicode') {
                this.set('currentCateogry', 'RappiCode');
                Ember.$('#headerProductSearchField').attr("placeholder", "Ingresa tu RappiCode");
            } else {
                this.set('currentCateogry', 'Todos');
            }
            if (category !== 'rappicode') {
                this.setSearchFilter();
            }
        },
        search: function (queryField, liValue, liId) {

            let storeType = this.storage.get(stStoreType);
            let ids = '';
            if (liValue === undefined) {
                if (Ember.$('.auto-complete').find('li').hasClass("active")) {
                    queryField = Ember.$('.auto-complete li.active').text();
                    ids = Ember.$('.auto-complete li.active').attr("data");
                } else {
                    if (queryField === '' && this.storage.get(stStoreType) !== 'restaurant') {
                        this.get('router').transitionTo('home.store', storeType);
                        this.set("hits", []);
                        this.set("restaurants", []);
                        return;
                    }
                    let hits = this.get("hits");
                    let arr = [];
                    for (var key in hits) {
                        if (hits.hasOwnProperty(key)) {
                            arr.push(hits[key].id);
                        }
                    }
                    ids = arr.toString();
                }
            } else {
                queryField = liValue;
                ids = liId;
            }
            this.set("queryField", queryField);
            this.set("hits", []);

            let productId = ids;
            let product = queryField;

            if (this.storage.get(stStoreType) === 'rappicode') {
                productId = 0;
                this.get('router').transitionTo(`home.search`, storeType, productId, queryField);
                return;
            }

            if (ids === '') {
                return;
            }
            this.get('router').transitionTo(`home.search`, storeType, productId, product);
        },
        redirectToHome: function (storeType) {
            if (this.get('session').get('isAuthenticated')) {
                let address = this.storage.get(stAddress);
                let lat = this.storage.get(stLat);
                let lng = this.storage.get(stLng);
                let id = this.storage.get(stAddressId);
                let shippingAddress = {
                    id: id || 0,
                    address: address,
                    lat: lat,
                    lng: lng
                };
                this.cart.createCart(storeType, this.storage.get(stShippingCharges), shippingAddress);
            }
            this.sendAction("changeStoreType", storeType);
        },
        goToCategory: function (storeType, categoryId, subCategoryId, storeId) {
            if (storeType === "super") {
                mixpanel.track("enter_super_category");
            }
            Ember.$(".navigation-item").removeClass("active");
            Ember.$(".main-subcategory-menu").css("display", "none");
            this.storage.set(stStoreType, storeType);
            this.storage.set(stStoreId, storeId);
            this.storage.set(stSelectedSubcorridorId, subCategoryId);
            this.get('router').transitionTo(`home.corridor`, categoryId);
        },
        goToSubcategory: function (storeType, subcategoryId, storeId) {
            Ember.$(".navigation-item").removeClass("active");
            Ember.$(".main-subcategory-menu").css("display", "none");
            this.storage.set(stStoreType, storeType);
            this.storage.set(stStoreId, storeId);
            this.get('router').transitionTo(`home.subcorridor`, subcategoryId);
        },
        removeProduct: function (product) {
            let id = product.id;
            let storeType = this.storage.get(stStoreType);
            this.cart.removeItemFromCart(storeType, { id });
        },
        openBasket: function () {
            //mixpanel events
            let storeType = this.storage.get(stStoreType);
            mixpanel.track("open_cart");
            if (window.location.pathname.includes("whims-and-desires") || window.location.hash.includes("whims-and-desires")) {
                mixpanel.track("open_cart_antojos");
            } else if (storeType === "express") {
                mixpanel.track("open_cart_express");
            } else if (storeType === "restaurant") {
                mixpanel.track("open_cart_restaurant");
            } else if (storeType === "farmacia") {
                mixpanel.track("open_cart_farmica");
            } else if (storeType === "super") {
                mixpanel.track("open_cart_super");
            }
            Ember.$('#product-basket').collapse('show');
            Ember.$('#productMSG').stop(true, true).delay(200).fadeOut(500);
            this.sendAction('basketOpenned');
        },
        addNewDirection: function () {
            this.set('flow', 'change-direction');
            this.toggleProperty('showAddAddressToUpdate');
        },
        openAddresslist: function () {
            if (this.get('addressListOpen')) {
                Ember.$('#addressListPopup').css('display', 'none');
            } else {
                Ember.$('#addressListPopup').css('display', 'block');
            }
            this.toggleProperty('addressListOpen');
        },
        openAddresslistAfterLogin: function () {
            if (this.get('addressListOpen')) {
                Ember.$('#addressListPopupAfterLogin').css('display', 'none');
            } else {
                Ember.$('#addressListPopupAfterLogin').css('display', 'block');
                var top = Ember.$('.scroll-bg').height();
                if (top < 158) {
                    Ember.$('.new-addr-block-scroll').css('top', top - 5);
                } else {
                    Ember.$('.new-addr-block-scroll').css('top', 158);
                }
            }
            this.toggleProperty('addressListOpen');
        },
        updateAddress(addressObj) {
            this.get('addresses').forEach((address)=> {
                Ember.$('#' + address.get('id')).css('background-color', '#fafafa');
                if (address.get('tag') === 'novi@') {
                    Ember.$('#' + address.get('id') + " img").attr("src", "assets/images/heart-icon-copy20x19.svg");
                } else if (address.get('tag') === 'oficina' || address.get('tag') === 'casa') {
                    Ember.$('#' + address.get('id') + " img").attr("src", "assets/images/office-icon-copy21x21.svg");
                } else {
                    Ember.$('#' + address.get('id') + " img").attr("src", "assets/images/moustache-icon-copy21x8.svg");
                }
            });

            Ember.$('#' + addressObj.get('id')).css('background-color', '#40d27e');

            if (addressObj.get('tag') === 'novi@') {
                Ember.$('#' + addressObj.get('id') + " img").attr("src", "assets/images/heart-icon20x19.svg");
            } else if (addressObj.get('tag') === 'oficina' || addressObj.get('tag') === 'casa') {
                Ember.$('#' + addressObj.get('id') + " img").attr("src", "assets/images/office-icon21x21.svg");
            } else {
                Ember.$('#' + addressObj.get('id') + " img").attr("src", "assets/images/moustache-icon21x8.svg");
            }
            let currentCountry = this.storage.get(stContent) ? this.storage.get(stContent).countryName : ENV.location[0].name;
            var _this = this;
            var geocoder = new window.google.maps.Geocoder();
            var latlng = {lat: parseFloat(addressObj.get('lat')), lng: parseFloat(addressObj.get('lng'))};
            geocoder.geocode({'location': latlng}, function (results) {
                var addressComponents = results[0].address_components;
                addressComponents.forEach((component)=> {
                    var componentType = component.types;
                    if (componentType[0] === 'country') {
                        _this.send('openAddresslistAfterLogin');
                        if ((component.long_name === currentCountry) || (component.long_name === 'Mexico')) {
                            if (_this.get('activeAddress') !== null) {
                                let activeAddress = _this.get('activeAddress');
                                activeAddress.set('active', false);
                            }
                            addressObj.set("active", true);

                            let storeType = _this.storage.get(stStoreType);
                            let id = addressObj.get('id');
                            let address = addressObj.get('address');
                            let description = addressObj.get('description');
                            let lng = addressObj.get('lng');
                            let lat = addressObj.get('lat');
                            let tag = addressObj.get('tag');
                            let active = addressObj.get('active');
                            let lastorder = addressObj.get('lastorder');
                            addressObj.save().then(()=> {
                                let storageAddressId = _this.storage.get(stAddressId)
                                let addLat = lat ? Math.abs(lat) : 0;
                                let addLng = lng ? Math.abs(lng) : 0;
                                let storageLat = _this.storage.get(stLat) ? Math.abs(_this.storage.get(stLat)) : 0;
                                let storageLng = _this.storage.get(stLng) ? Math.abs(_this.storage.get(stLng)) : 0;

                                if (Ember.isEmpty(storageAddressId) || storageAddressId.toString !== id.toString()) {
                                    _this.storage.set(stLat, lat);
                                    _this.storage.set(stLng, lng);
                                    _this.storage.set(stAddress, address);
                                    _this.storage.set(stAddressId, id);
                                    _this.storage.set(stCity, tag);
                                    _this.set('storageCity', tag);
                                    _this.set('cartAddress', address);
                                    if (Ember.isPresent(storeType)) {
                                        _this.cart.setShippingAddress(storeType, {
                                            id,
                                            address,
                                            description,
                                            lng,
                                            lat,
                                            tag,
                                            active,
                                            lastorder
                                        });
                                    }
                                    if ((Math.abs(addLat - storageLat) > 0.000001 || Math.abs(addLng - storageLng) > 0.000001)) {

                                        window.location.reload(true);
                                    }
                                }
                            });
                        } else {
                            alert('Por favor, seleccione una dirección de ' + currentCountry);
                            return;
                        }
                    }
                });
            });
        },
        openGreenAddressPopup: function () {
            this.send('openAddresslist');
            this.toggleProperty('showAddressPopup');
        },
    },
    keyPress: function (e) {
        if (e.keyCode === 13) {
            let value = Ember.$('.auto-complete li.active a').text();
            let key = Ember.$('.auto-complete li.active').attr('data');
            if (!Ember.$('.auto-complete').find('li').hasClass("active")) {
                this.send("search", this.get("queryField"));
                return;
            }
            this.send("search", '', value, key);
            this.set("hits", []);
            return;
        }
        if (e.keyCode === 27) {
            this.set("hits", []);
            return;
        }
        if (e.keyCode === 9 && e.keyCode === 38 && e.keyCode === 40) {
            return;
        }
    },
    requestAutoComplete: function() {
        if (Ember.isBlank(Ember.$("#headerProductSearchField").val())) {
            return;
        }

        var client = algoliasearch(`${ENV.ALGOLIA_APPLICATION_ID}`, `${ENV.ALGOLIA_API_KEY}`);
        let indexName = `${ENV.INDEX_NAME}`;
        let content = this.storage.get(stContent)
        if (content !== undefined && content.code.toLowerCase() === "mx") {
            indexName = `${ENV.INDEX_NAME_MX}`;
        }
        var index = client.initIndex(indexName);
        let currentType = this.get('currentType');
        this.set("fetching", true);
        index.search(Ember.$("#headerProductSearchField").val(), {
            attributesToRetrieve: ['id', 'name', 'description'],
            hitsPerPage: 30,
            filters: this.get("algoliaFilters")
        }, (err, content)=> {

            if (err) {
                return;
            }
            if (currentType === "restaurant") {
                this.apiService.get(`${ENV.rappiServerURL}api/web/search/restaurants?text=${Ember.$("#headerProductSearchField").val()}`, null)
                    .then((data)=> {
                        this.set("restaurants", data);
                        this.set("hits", content.hits);
                        this.set("fetching", false);
                    }).catch((error)=> {
                        this.set("restaurants", []);
                        this.set("hits", content.hits);
                        this.set("fetching", false);
                    });
            } else {
                this.set("hits", content.hits);
                this.set("fetching", false);
            }
        });
    },
    keyUp: function (e) {
        var $this;
        if (!Ember.$('.auto-complete').find('li').hasClass("active") && e.keyCode === 40) {
            $this = Ember.$('.auto-complete').find('li').first().focus();
        } else if (e.keyCode !== 38) {
            $this = Ember.$('.auto-complete').find('.active').next().focus();
        }

        if (e.keyCode === 40) {
            $this.addClass('active').siblings().removeClass();
            $this.closest('ul.auto-complete').scrollTop($this.index() * $this.outerHeight());
            this.set("queryField", Ember.$('.auto-complete li.active a').text());
            return false;
        } else if (e.keyCode === 38) {
            $this = Ember.$('.auto-complete').find('.active').prev().focus();
            $this.addClass('active').siblings().removeClass();
            $this.closest('ul.auto-complete').scrollTop($this.index() * $this.outerHeight());
            this.set("queryField", Ember.$('.auto-complete li.active a').text());
            return false;
        }

        this.set("hits", []);
        this.set("restaurants", []);
        let _this = this;
        Ember.run.debounce(this, _this.requestAutoComplete, 250);
    },
    focusOut: function (e) {
        let time = 300;
        if (e.target.toString().substring(1, 2) === "a") {
            time = 5;
        }
        Ember.run.later(this, function () {
            this.set("hits", []);
            this.set("restaurants", []);
        }, time);

        Ember.run.later(this, function () {
            this.set('unSelectedCountry', false);
        }, 300);
    },
    click: function (e) {
        if (e.target.toString().indexOf('p') === -1 && e.target.toString().indexOf('selected-category') === -1) {
            this.set("showSearchCategoryMenu", false);
        }
    }
});
