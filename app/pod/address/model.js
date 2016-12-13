import DS from 'ember-data';

export default DS.Model.extend({
  application_user_id: DS.belongsTo('user'),
  address: DS.attr('string'),
  active: DS.attr('boolean', {defaultValue: false}),
  lat: DS.attr('string'),
  lng: DS.attr('string'),
  description: DS.attr('string'),
  tag: DS.attr('string')
});
