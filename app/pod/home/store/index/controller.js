import Ember from 'ember';

export default Ember.Controller.extend({
    serverUrl: Ember.inject.service('server-url'),
    url: "",
    storeType: null,
    showModalReg: false,
    session: Ember.inject.service('session'),
    restaurantPlatesView: false,
    selectCorridors: [],
    corridors: [],
    corridorsCount: Ember.computed.alias('corridors.length'),
    showAllRestaurantHere: false,
    basketOpenned: false,
    mobileView: false,
    showCreateListDialog: false,
    loading: false,
    selectedRestaurantCategory: 0,
    init(){
        this._super(...arguments);
        let currentUrl = this.get("currentUrl");
        this.set("url", currentUrl);
    },
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
    actions: {
        showCreateListDialog: function() {
            this.toggleProperty('showCreateListDialog');
        },
        showDialog: function () {
            this.toggleProperty('showModalReg');
        },
        logout(){
            this.get('session').set('data.cart', null);
            this.get('session').invalidate();
        },
        click: function () {
            Ember.$('#product-basket').collapse('hide');
            this.set('overflow', false);
            Ember.$("body").css("overflow", "auto");
        },
        productList: function (data) {
            this.set("restaurantsView", false);
            this.set("restaurantPlatesView", true);
            this.set("selectCorridors", data);
        },
        loadRestaurantCategory: function(catId) {
            this.set("selectedRestaurantCategory", catId);
            if (catId === 0) {
                this.set('popularStores', this.get('allPopularStores'));
                this.set('recommendedProducts', this.get('allRecommendedProducts'));
            } else {
                let currentUrl = this.serverUrl.getUrl();
                let lat = this.get('stLat');
                let lng = this.get('stLng');
                this.set("loading", true);
                Ember.$.getJSON(`${currentUrl}api/web/stores/restaurant/categories/${catId}?lng=${lng}&lat=${lat}`).then((resp) => {
                    this.set('loading', false);
                    this.set('popularStores', resp.stores);
                    var popular_products = [];
                    resp.popular_products.forEach((popular_product) => {
                        if (popular_product.image !== "NO-IMAGE" && popular_product.price > 15000) {
                            popular_products.push(popular_product);
                        }
                    });
                    popular_products = this.shuffle(popular_products);
                    this.set('recommendedProducts', popular_products);
                });
            }
        }
    }
});
