import Ember from 'ember';

export default Ember.Component.extend({
    diligences: [""],
    selectedIndex: 0,
    init(){
        this._super(...arguments);
    },
    actions: {
        addDiligence: function(id, name) {
            var diligences = this.get("diligences");
            diligences.pushObject("");
            this.set("diligences", diligences);
            this.set("selectedIndex", diligences.length - 1);
        },
        makeActive: function(index) {
            this.set("selectedIndex", index);
        },
        delete: function(indexToDelete) {
            let newDiligences = [];
            Ember.$(".diligence-content").each(function(index, ele) {
                if (indexToDelete !== index) {
                    newDiligences.pushObject(Ember.$(ele).text());
                }
            });
            this.set("diligences", newDiligences);
            this.set("selectedIndex", newDiligences.length - 1);
        },
        addToBasket: function() {
            let diligences = [];
            Ember.$(".diligence-content").each(function(index, ele) {
                diligences.pushObject(Ember.$(ele).text());
            });
            let strDiligences = diligences.join(";");
            let what = "RAPPIFAVOR:" + strDiligences;
            let where = "RAPPIFAVORWEB";
            let whim = what + "&whim&" + where;
            let whimObj = {
              text: whim, what, where
            };
            this.cart.pushWhim(whimObj);
            let height = Ember.$(window).height();
            Ember.$(".products-basket").css("max-height", height - 80);
            Ember.$(".products-basket").css("height", height - 80);
            Ember.$('#product-basket').collapse('show');
            Ember.$('#productMSG').stop(true, true).delay(200).fadeOut(500);
            this.set("basketOpenned", true);
        }
    }
});
