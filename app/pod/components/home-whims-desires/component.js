import Ember from 'ember';
export default Ember.Component.extend({
  what: null,
  where: null,
  blankField: false,
  message: null,
  color: null,
  showLeftMenu: false,
  didRender() {
    this._super(...arguments);
    let _this = this;
    Ember.$("#asd").scroll(function () {
      let scrollHeight = Ember.$("#asd")[0].scrollHeight;
      let scrollTop = Ember.$("#asd").scrollTop();
      let height = Ember.$("#asd").height();
      if (scrollTop + height === scrollHeight) {
        _this.sendAction('scrollEnd');
      }
    });
  },
  init() {
    this._super(...arguments);
    let storedWhims = this.cart.getWhim();
    if (Ember.isPresent(storedWhims) && Ember.isPresent(storedWhims.text)) {
      let whatWhere = storedWhims.text.split('&whim&');
      this.set('what', whatWhere[0]);
      this.set('where', whatWhere[1]);
    }
    let whims = this.get('model') ? this.get('model').whims : undefined;
    if (Ember.isPresent(whims) && Ember.isPresent(storedWhims) && Ember.isPresent(storedWhims.text)) {
      let _this = this;
      whims.forEach((whimObj)=> {
        if (storedWhims.text.indexOf(whimObj.text) >= 0) {
          Ember.set(whimObj, 'isAdded', true);
          Ember.set(whimObj, 'buttonText', "añadido a la cesta");
          _this.set('addedWhimObj', whimObj);
          return;
        }
      });
    }

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
    }, 3000);
  },
  actions: {
    addWhat:function(){
      let what = this.get('what');
      if (Ember.isPresent(what)) {
       Ember.$("#where-div").removeClass("translate-antojo-where-div");
        Ember.$("#what-div").addClass("translate-antojo-what-div");
      } else {
        this.setMessage('msg-error', 'Los campos que no pueden dejarse en blanco.');
      }
    },
    backToWhat:function(){
      Ember.$("#what-div").removeClass("translate-antojo-what-div");
      Ember.$("#where-div").addClass("translate-antojo-where-div");
    },
    addWhim: function () {
      this.set('blankField', false);
      let what = this.get('what');
      let where = this.get('where');
      let storedWhims = this.cart.getWhim();
      if (Ember.isPresent(storedWhims) && Ember.isPresent(storedWhims.text)) {
        let whatWhere = storedWhims.text.split('&whim&');
        if (what === whatWhere[0] && where === whatWhere[1]) {
          this.send("openBasket");
          return;
        }
      }
      if (Ember.isPresent(what) && Ember.isPresent(where)) {
        let whim = what + "&whim&" + where;
        let whimObj = {
          text: whim, what, where
        };
        this.cart.pushWhim(whimObj);
        mixpanel.track("Global_add_product");
        mixpanel.track("add_to_cart_antojos");
        this.send("openBasket");
        this.set('addedWhimObj', whimObj);
      } else {
        this.setMessage('msg-error', 'Los campos que no pueden dejarse en blanco.');
      }
    }, addToBasket(whimObj) {
      let addedWhimObj = this.get('addedWhimObj');
      if (Ember.isPresent(addedWhimObj)) {
        Ember.set(addedWhimObj, 'buttonText', "+ agregar a la canasta");
        Ember.set(addedWhimObj, 'isAdded', false);
      }
      Ember.set(whimObj, 'isAdded', true);
      Ember.set(whimObj, 'buttonText', "añadido a la cesta");
      this.set('addedWhimObj', whimObj);
      this.cart.pushWhim(whimObj);
      mixpanel.track("add_antojos_to_cart_by_antojo_section");
    },
    openBasket(){
      Ember.$(".products-basket").css("max-height", (Ember.$(window).height() - 100));
      Ember.$('#product-basket').collapse('show');
      Ember.run.later(this, function () {
        this.set("basketOpenned", true);
      }, 100);
    }
  },
  willDestroyElement() {
    Ember.run.cancel(this.get("antojoAnimator"));
    Ember.run.cancel(this.get("antojoTextAnimator"));
  },
});
