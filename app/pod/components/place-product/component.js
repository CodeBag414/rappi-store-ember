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
    if (this.get("isPlace")) {
      Ember.$('._green').css('left', 0);
      Ember.$('.place').css('color', 'white');
      Ember.$('.product').css('color', '#a6a5a5');
    } else {
      Ember.$('._green').css('left', '50%');
      Ember.$('.place').css('color', '#a6a5a5');
      Ember.$('.product').css('color', 'white');
    }
  },
  init() {
    this._super(...arguments);
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
  openBasket: function () {
    Ember.$('#product-basket').collapse('show');
    Ember.$('#productMSG').stop(true, true).delay(200).fadeOut(500);
    this.sendAction('basketOpenned');
  },
  actions: {
    addWhim: function () {
      this.set('blankField', false);
      let what = this.get('what');
      let where = this.get('where');
      if (this.get('isPlace'))
      {
        where = this.get('keyword');
      } else {
        what = this.get('keyword');
      }
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
        this.set('addedWhimObj', whimObj);
        this.setMessage('msg-sucess', ' ¡Has agregado tu antojo a la canasta de compras!');
        this.set('basketOpenned', true);
        this.openBasket();
      } else {
        this.setMessage('msg-error', 'Los campos que no pueden dejarse en blanco.');
      }
    },
    selectMeaning: function(type) {
      if (type == 'place')
      {
        Ember.$('._green').css('left', 0);
        Ember.$('.place').css('color', 'white');
        Ember.$('.product').css('color', '#a6a5a5');
        this.set('isPlace', true);
      } else {
        Ember.$('._green').css('left', '50%');
        Ember.$('.place').css('color', '#a6a5a5');
        Ember.$('.product').css('color', 'white');
        this.set('isPlace', false);
      }
    }
  }
});
