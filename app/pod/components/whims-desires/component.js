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
  }, setMessage(color, message) {
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
    addWhim: function () {
      this.set('blankField', false);
      let what = this.get('what');
      let where = this.get('where');
      let storedWhims = this.cart.getWhim();
      if (Ember.isPresent(storedWhims) && Ember.isPresent(storedWhims.text)) {
        let whatWhere = storedWhims.text.split('&whim&');
        if (what === whatWhere[0] && where === whatWhere[1]) {
          this.setMessage('msg-error', 'No se encontraron cambios.');
          return;
        }
      }
      if (Ember.isPresent(what) && Ember.isPresent(where)) {
        let whim = what + "&whim&" + where;
        let whimObj = {
          text: whim, what, where
        };
        this.cart.pushWhim(whimObj);
        mixpanel.track("add_to_cart_antojos");
        this.set('addedWhimObj', whimObj);
        this.setMessage('msg-sucess', ' ¡Has agregado tu antojo a la canasta de compras!');
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
    }
  }
});
