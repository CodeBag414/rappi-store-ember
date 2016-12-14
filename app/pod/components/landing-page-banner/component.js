import Ember from 'ember';
import ENV from 'rappi/config/environment';
import mixinMixpanelSearch from "../../../mixins/mix-panel-search-common-event";


const {
    stLat,
    stLng,
    stAddress,
    stContent,
    stStoreType,
    stShippingCharges,
    stAddressId,
    stStoreId,
    stShowPromoBanner
    } = ENV.storageKeys;

export default Ember.Component.extend(mixinMixpanelSearch, {
    flashMessages: Ember.inject.service(),
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
    currentCateogry: '',
    isWhimSelected: false,
    currentType: null,
    hits: [],
    restaurants: [],
    algoliaFilters: "",
    backgraoundImageVisiable: false,
    isSearchStarted: false,
    classToTransform: '.search-bar-transform',
    fetching: false,
    init() {
        this._super(...arguments);
        let _this = this;
        let content = this.storage.get(stContent);
        if (content !== undefined) {
            this.set('currentCountry', content.countryName);
            if (content.code.toLowerCase() === "mx") {
                this.set("countryBanner", false);
            }
        }

        let category = this.storage.get(stStoreType);

        if (category === "super") {
            this.set('currentCateogry', 'Supermercado');
        } else if (category === 'express') {
            this.set('currentCateogry', 'Tienda Express');
        } else if (category === 'restaurant') {
            this.set('currentCateogry', 'Restaurantes');
        } else if (category === 'farmacia') {
            this.set('currentCateogry', 'Farmacia');
        } else {
            this.set('currentCateogry', 'RappiCode');
        }

        this.sendAction('setClassToTransform', this.get('classToTransform'));

        if (category !== 'rappicode'){
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
    },
    setMessage(color, message) {
        this.set('blankField', true);
        this.set('color', color);
        this.set('message', message);
        let _this = this;
        Ember.run.later(() => {
            _this.set('blankField', false);
            _this.set('color', null);
            _this.set('message', null);
        }, 5000);
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
        } else if (store_types === ENV.defaultStoreType) {
            store_types = "hiper";
        }
        if (this.get("currentType") === null || store_types !== this.get("currentType")) {
            this.set("hits", []);
            this.set("restaurants", []);
            this.set("currentType", store_types);
            let _this = this;
            var objectToResolve = {};
            Ember.RSVP.hashSettled({
                stores: Ember.$.getJSON(`${currentUrl}${ENV.storage}lat=${latitude}&lng=${longitude}&store_types=${store_types}`)
            }).then(function (hashResult) {
                Object.keys(hashResult).forEach(function (key) {
                    if (hashResult[key].state === 'fulfilled') {
                        objectToResolve[key] = hashResult[key].value;
                    } else {
                        objectToResolve[key] = [];
                    }
                });
                if (Ember.isEmpty(objectToResolve['stores']) && store_types === "hiper") {
                    return Ember.RSVP.hashSettled({
                        stores: Ember.$.getJSON(`${currentUrl}${ENV.storage}lat=${latitude}&lng=${longitude}&store_types=${ENV.defaultStoreType}`)
                    })
                }
            }).then(function (hashResult) {
                if (hashResult) {
                    Object.keys(hashResult).forEach(function (key) {
                        if (hashResult[key].state === 'fulfilled') {
                            objectToResolve[key] = hashResult[key].value;
                        } else {
                            objectToResolve[key] = [];
                        }
                    });
                }
                if (Ember.isPresent(objectToResolve['stores'])) {
                    let result = objectToResolve['stores'].stores;
                    let filterString = "";
                    for (var key in result) {
                        if (result[key].store_id > 0) {
                            filterString += result[key].store_id.toString() + " OR ";
                        }
                    }
                    filterString = filterString.substr(0, filterString.lastIndexOf(" OR "));
                    _this.set("algoliaFilters", filterString);
                }
            }).catch(function (error) {
                console.info("err>> is ...", err);
                _this.set("algoliaFilters", "");
            });
        }
    },
    didRender(){
        this._super(...arguments);
        if (!this.get("setPositions")) {
            this.set("setPositions", true);
            if (Ember.isEmpty(this.storage.get(stShowPromoBanner)) || this.storage.get(stShowPromoBanner)) {
                Ember.$(".banner-container").css({"top": "63px"});
            }
        }
    },
    didInsertElement(){
        this._super(...arguments);
        let session = this.get('session');
        Ember.$('.btn1').click(function () {

        });

        if (session.get("isAuthenticated")) {
            Ember.run.later(function () {
                Intercom('boot', {
                    app_id: ENV.interComAppId,
                    name: session.get('currentUser').get('name'),
                    email: session.get('currentUser').get('email'),
                    created_at: new Date().getTime()
                });
            }, 2000);
        } else {
            Intercom('boot', {
                app_id: ENV.interComAppId,
            });
        }
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
        whatEnterAction: function (what) {
            if (what.trim() !== "") {
                Ember.$('#whim').focus();
            }
        },
        searchByEnter: function () {
            let value = Ember.$('.auto-complete li.active a').text();
            let key = Ember.$('.auto-complete li.active').attr('data');
            if (!Ember.$('.auto-complete').find('li').hasClass("active")) {
                this.send("search", this.get("queryField"));
                return;
            }
            this.send("search", '', value, key);
            this.set("hits", []);
            this.set("restaurants", []);
            return;
        },
        toggle(className){
            let what = this.get('what');
            if (Ember.isEmpty(what) || what.trim().length === 0) {
                this.get('flashMessages').danger('Por favor escribe lo que necesitas');
                return;
            }
            Ember.$(".whim-search").addClass("whim-search-dynamic");

            if (Ember.isEmpty(className) && this.get('classToTransform') === '.search-bar-transform') {
                className = '.search-bar-transform-whim';
            } else if (Ember.isEmpty(className) && this.get('classToTransform') === '.search-bar-transform-whim') {
                className = '.search-bar-transform';
            }
            if (Ember.$(".button-whim-1 .arrow-button").css("transform") == "matrix(-1, 1.22465e-16, -1.22465e-16, -1, 0, 0)") {
                Ember.$(".button-whim-1 .arrow-button").css("transform", "rotate(0deg)");
            } else {
                Ember.$(".button-whim-1 .arrow-button").css("transform", "rotate(180deg)");
            }
            this.set('classToTransform', className);
            this.sendAction('setClassToTransform', className);
            $(event.target).parents('.banner-container').toggleClass('active');
            Ember.$("#whim1").focus();
            Ember.run.later(this, function () {
                Ember.$(".whim-search").removeClass("whim-search-dynamic");
            }, 400);
        },
        showDialog: function () {
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
            Ember.$('.banner-container').css('z-index', 102);
            Ember.$('.menu-container').css('z-index', 101);
            this.toggleProperty('showSearchCategoryMenu');
        },
        logout(){
            this.get('session').invalidate();
        },
        toggleAddressList: function () {
            this.set('showAddressListToUpdate', false);
        }, toggleAddAddress: function () {
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
        selectCountry: function (countryName) {
            let value = countryName === 'colombia' ? 0 : 1;
            let envLoction = ENV.location;
            let location = envLoction[value][envLoction[value].name];

            let lat = location.lat;
            let lng = location.lng;
            let session = this.get('session');
            this.set('currentlyLoading', true);
            this.apiService.get(`${ENV.rappiServerURL}${ENV.resolveCountry}lat=${lat}&lng=${lng}`, null)
                .then((resp)=> {
                    resp.server = resp.server.replace('http://', 'https://');
                    resp.countryName = resp.code === 'MX' ? "Mexico" : resp.name;
                    this.serverUrl.currentUrl(resp);
                    this.serverUrl.setdataByCountry(()=> {
                        resp.currentCountry = resp.countryName;
                        this.storage.set(stLat, lat);
                        this.storage.set(stLng, lng);
                        this.storage.set(stContent, resp);
                        if (session.get("isAuthenticated")) {
                            this.logout();
                            return;
                        }
                        window.location.reload(true);
                    });
                }, (error)=> {

                    this.set('currentlyLoading', false);
                });
            this.set('unSelectedCountry', false);
        },
        selectSearchCategory: function (category) {
            mixpanel.track("search_dropdown_change");
            this.toggleProperty('showSearchCategoryMenu');
            if (category === "todos") {
                this.storage.set(stStoreType, null);
            } else if (category !== "whim") {
                this.storage.set(stStoreType, category);
            }
            Ember.$('#productSearchField').attr("placeholder", "¿Qué estás buscando?");
            this.set('isWhimSelected', false);
            if (category === "super") {
                this.set('currentCateogry', 'Supermercado');
                Ember.run.later(this, function () {
                    Ember.$("#productSearchField").focus();
                }, 200);
            } else if (category === 'express') {
                this.set('currentCateogry', 'Tienda Express');
                Ember.run.later(this, function () {
                    Ember.$("#productSearchField").focus();
                }, 200);
            } else if (category === 'restaurant') {
                this.set('currentCateogry', 'Restaurantes');
                Ember.run.later(this, function () {
                    Ember.$("#productSearchField").focus();
                }, 200);
            } else if (category === 'farmacia') {
                this.set('currentCateogry', 'Farmacia');
                Ember.run.later(this, function () {
                    Ember.$("#productSearchField").focus();
                }, 200);
            } else if (category === 'whim') {
                this.set('currentCateogry', 'Antojos');
                this.set('isWhimSelected', true);
                Ember.run.later(this, function () {
                    Ember.$("#what1").focus();
                }, 200);
            } else {
                this.set('currentCateogry', 'RappiCode');
                Ember.$('#productSearchField').attr("placeholder", "Ingresa tu RappiCode");
            }
            if (category !== 'rappicode') {
                this.setSearchFilter();
            }
        },
        search: function (queryField, liValue, liId) {
            this.set("isSearchStarted", false);
            let storeType = this.storage.get(stStoreType);
            this.searchMixpanelEvent();
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
            this.set('searching', true);
            this.get('router').transitionTo(`home.search`, storeType, productId, product);
        },
        addWhim: function (isToggle) {
            if (isToggle) {
                let where = this.get('where');
                if (Ember.isEmpty(where) || where.trim().length === 0) {
                    this.get('flashMessages').danger('Por favor escribe donde lo conseguimos');
                    return;
                }
                this.send('toggle', '.search-bar-transform');
            }
            let what = this.get('what');
            let where = this.get('where');
            let storedWhims = this.cart.getWhim();
            if (Ember.isPresent(storedWhims) && Ember.isPresent(storedWhims.text)) {
                let whatWhere = storedWhims.text.split('&whim&');
                if (what === whatWhere[0] && where === whatWhere[1]) {
                    this.setMessage('msg-error', 'No se encontraron cambios.');
                    Ember.$(".products-basket").css("max-height", (Ember.$(window).height() - 100));
                    Ember.$('#product-basket').collapse('show');
                    Ember.run.later(this, function () {
                        this.set("basketOpenned", true);
                    }, 100);
                    return;
                }
            }
            if (Ember.isPresent(what) && Ember.isPresent(where)) {
                let whim = what + "&whim&" + where;
                let whimObj = {
                    text: whim, what, where
                };
                this.cart.pushWhim(whimObj);
                this.set('addedWhimObj', whimObj);

                Ember.$(".products-basket").css("max-height", (Ember.$(window).height() - 100));
                Ember.$('#product-basket').collapse('show');
                Ember.run.later(this, function () {
                    this.set("basketOpenned", true);
                }, 100);
            } else {
                this.setMessage('msg-error', 'Los campos que no pueden dejarse en blanco.');
            }
        }
    },
    keyPress: function (e) {
        if (['what', 'what1'].indexOf(e.target.id) >= 0 || ['whim', 'whim1'].indexOf(e.target.id) >= 0) {
            return;
        }
        Ember.$('.banner-container').css('z-index', 102);
        Ember.$('.menu-container').css('z-index', 101);
        // if (e.keyCode === 13) {
        //   console.log("AAAAAA");
        //   let value = Ember.$('.auto-complete li.active a').text();
        //   let key = Ember.$('.auto-complete li.active').attr('data');
        //   if (!Ember.$('.auto-complete').find('li').hasClass("active")) {
        //     this.send("search", this.get("queryField"));
        //     return;
        //   }
        //   this.send("search", '', value, key);
        //   this.set("hits", []);
        //   return;
        // }
        if (e.keyCode === 27) {
            this.set("hits", []);
            return;
        }
        if (e.keyCode === 9 && e.keyCode === 38 && e.keyCode === 40) {
            return;
        }
    },
    requestAutoComplete: function() {
        if (Ember.isBlank(Ember.$("#productSearchField").val())) {
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

        if (!this.get("isSearchStarted")) {
            this.set("isSearchStarted", true);
            mixpanel.track("search_started");
        }
        this.set("fetching", true);
        index.search(Ember.$("#productSearchField").val(), {
            attributesToRetrieve: ['id', 'name', 'description'],
            hitsPerPage: 30,
            filters: this.get("algoliaFilters")
        }, (err, content)=> {
            if (err) {
                return;
            }
            if (currentType === "restaurant") {
                this.apiService.get(`${ENV.rappiServerURL}api/web/search/restaurants?text=${Ember.$("#productSearchField").val()}`, null)
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
        if (['what', 'what1'].indexOf(e.target.id) >= 0 || ['whim', 'whim1'].indexOf(e.target.id) >= 0) {
            return;
        }
        var $this;
        Ember.$('.banner-container').css('z-index', 102);
        Ember.$('.menu-container').css('z-index', 101);

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
        if (e.target.toString().indexOf('p') == -1 && e.target.toString().indexOf('selected-category') == -1) {
            this.set("showSearchCategoryMenu", false);
        }
    },
    keyPress: function (e) {
        let keyCode = e.keyCode;
        if (e.target.id === "what1" && keyCode === 13) {
            this.send('toggle');
        } else if (e.target.id === "whim1" && keyCode === 13) {
            this.send('addWhim', true);
        }
    }
});
