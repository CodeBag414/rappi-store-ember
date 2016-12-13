import Ember from 'ember';

export default Ember.Helper.helper(function(params) {
  let value = parseInt(params[0]);
  let re = '\\d(?=(\\d{3})+$)';
  return '$ '+value.toFixed(0).replace(new RegExp(re, 'g'), '$&.');
});
