import DS from 'ember-data';

export default DS.RESTSerializer.extend({

  normalizeResponse: function (store, primaryModelClass, payload, id, requestType) {
    let newPayload = {list: payload};
    return this._super(store, primaryModelClass, newPayload, id, requestType);
  }

});
