import Ember from 'ember';

export default Ember.Object.extend({
  id: null,
  address: "",
  description: "",
  tag: "",
  active: false,
  lng: null,
  lastorder: 0,
  lat: null
});
