import DS from 'ember-data';

export default DS.Model.extend({
  bin: DS.attr('string'),
  name: DS.attr('string'),
  card_reference: DS.attr('string'),
  expiry_year: DS.attr('string'),
  termination: DS.attr('string'),
  expiry_month: DS.attr('string'),
  transaction_reference: DS.attr('string'),
  type: DS.attr('string'),
});
