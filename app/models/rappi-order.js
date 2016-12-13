import Ember from 'ember';

export default Ember.Object.extend(Ember.Evented, {
  id: null,
  state: "",
  address_description: "",
  tip: 0,
  total_value: 0,
  application_user_id: null,
  eta: 0,
  whim:null,
  comment: null,
  payment_method: "",
  products: null,
  address: "",
  _etaChanged: Ember.observer('eta', function () {
    this.trigger('etaChanged', this.get('eta'));
  })
});
