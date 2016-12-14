import Ember from 'ember';
import ENV from 'rappi/config/environment';
const {
        stStoreType,
        stStoreId
    } = ENV.storageKeys;

export default Ember.Component.extend({
    serverUrl: Ember.inject.service('server-url'),
    url: "",
    firstProduct: null,
    firstProductCount: 1,
    secondProduct: null,
    secondProductCount: 0,
    totalAmount: Ember.computed('firstProduct', 'firstProductCount', 'secondProduct', 'secondProductCount', function() {
        if (Ember.isPresent(this.firstProduct) && Ember.isPresent(this.secondProduct)) {
            return this.firstProduct.price * this.firstProductCount + this.secondProduct.price * this.secondProductCount;
        } else {
            return 0;
        }
    }),
    init(){
        this._super(...arguments);
        let currentUrl = this.serverUrl.getUrl();
        this.set("url", currentUrl);
        let corridors = this.get("corridors");
        this.set("firstProduct", corridors[0].products[1]);
        this.set("secondProduct", corridors[0].products[0]);
    },
    addProductToCart: function(product) {
        let id = product.id;
        let name = product.name;
        let price = product.price;
        let presentation = product.presentation;
        let lowImage = product.imagelow ? product.imagelow.replace(this.get('url'), "") : '';
        let image = product.image_low || lowImage;
        let storeId = product.store_id;
        let saleType = product.sale_type;
        let storeType = this.storage.get(stStoreType);

        let addedProduct = this.cart.pushCart(storeType, {
          id, name, unitPrice: price, image, extras: {presentation, storeId, saleType}
        });

        let cart = this.cart.getCart(storeType);
        if (Ember.isEmpty(cart) || Ember.isEmpty(cart.get('lineItems'))) {
          this.sendAction('newCartAdded', this.cart.getCart(storeType));
        }
    },
    actions: {
        selectFirstProduct: function(count) {
            this.set("firstProductCount", count);
            this.set("secondProductCount", 0);
        },
        decSecondProduct: function() {
            if (this.secondProductCount > 0) {
                this.set("secondProductCount", this.secondProductCount - 1);
            }
        },
        incSecondProduct: function() {
            if (this.get("totalAmount") <= 280000) {
                this.set("secondProductCount", this.secondProductCount + 1);
            }
        },
        goToSecondView: function() {
            this.set("firstProductCount", 0);
            this.set("secondProductCount", 1);
            Ember.$(".first-view").animate({"left":"315px"}, 300, function(){
                Ember.$(".second-view").animate({"left":"0px"}, 300, function() {
                    Ember.$(".first-view").css({"left":"-315px"});
                    Ember.$(".btn-to-first-view").fadeIn(100);
                });
            });
        },
        goToFirstView: function() {
            Ember.$(".second-view").animate({"left":"-315px"}, 300, function(){
                Ember.$(".first-view").animate({"left":"0px"}, 300, function() {
                    Ember.$(".second-view").css({"left":"315px"});
                    Ember.$(".btn-to-first-view").fadeOut(100);
                });
            });
        },
        addToCart: function () {
          mixpanel.track("Global_add_product");
          mixpanel.track("add_to_RappiCash");
          for (var i = 0; i<this.firstProductCount; i++) {
                this.addProductToCart(this.firstProduct);
            }
            for (var i = 0; i<this.secondProductCount; i++) {
                this.addProductToCart(this.secondProduct);
            }

            let height = Ember.$(window).height();
            Ember.$(".products-basket").css("max-height", height - 80);
            Ember.$(".products-basket").css("height", height - 80);
            Ember.$('#product-basket').collapse('show');
            Ember.$('#productMSG').stop(true, true).delay(200).fadeOut(500);
            this.set("basketOpenned", true);
        }
    }
});
