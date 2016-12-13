import Ember from 'ember';
export default Ember.Component.extend({
  what: null,
  where: null,
  blankField: false,
  message: null,
  color: null,
  showLeftMenu: false,

  init() {
    this._super(...arguments);

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
      console.log(what);
      console.log(where);
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
      } else {
        this.setMessage('msg-error', 'Los campos que no pueden dejarse en blanco.');
      }
    }
  }
});
