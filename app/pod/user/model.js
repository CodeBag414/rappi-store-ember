import DS from 'ember-data';

export default DS.Model.extend({
  first_name: DS.attr('string'),
  last_name: DS.attr('string'),
  gender: DS.attr('string'),
  identification_type: DS.attr('number'),
  identification: DS.attr('string'),
  default_cc: DS.attr(),
  email: DS.attr('string'),
  last_push_custom: DS.attr(),
  birth_date: DS.attr('date'),
  replacement_criteria_id: DS.attr('string'),
  refered_code: DS.attr('string'),
  phone: DS.attr('string'),
  remember_token: DS.attr(),
  is_phone_confirmed: DS.attr('boolean'),
  cc_blocked: DS.attr('boolean'),
  name: DS.attr('string'),
  pic: DS.attr('string'),
  tempPhone: DS.attr('string')
  //addresses: DS.hasMany('address')
});
