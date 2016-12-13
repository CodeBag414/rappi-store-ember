import Ember from 'ember';

const {
  computed,
  get
  } = Ember;

export default Ember.Object.extend(Ember.Evented, {
  id: "",
  name: "",
  quantity: 0,
  unitPrice: 0.00,
  image: "",
  extras: null,
  increment: true,

  totalPrice: computed('quantity', 'unitPrice', function () {
    return parseInt(get(this, 'quantity') * get(this, 'unitPrice'));
  }),

  toCartItem() {
    return this;
  },
  dumpCartItem(){
    this.trigger('cartItemRemoved', this.get('id'));
  }
});
