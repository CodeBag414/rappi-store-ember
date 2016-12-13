/**
 * Created by daffolap-301 on 11/6/16.
 */

import DS from 'ember-data';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import Ember from 'ember';

export default DS.RESTAdapter.extend(DataAdapterMixin, {
  serverUrl: Ember.inject.service('server-url'),
  authorizer: 'authorizer:application',
  namespace: 'api',
  primaryKey: 'id',
  host: Ember.computed('session.isAuthenticated', function () {
    return this.serverUrl.getUrl();
  }),
  /**
   *This method has been overridden as the web services for Rappi backend do not follow the REST and JSON<br>
   * architecture provided by the client.
   */
  pathForType: function (type) {
    if (type === 'user') {
      return "application-users";
    } else if (type === 'address') {
      return "application-users/address";
    } else if (type === "paymentz") {
      return "payementz/cc?env=pro";
    } else if (type === "list") {
      return "lists";
    }

    return type;
  },
  urlForFindAll(modelName) {
    let newURL;
    if (modelName === 'rappi-order') {
      newURL = "orders/status";
    }
    if (Ember.isPresent(newURL)) {
      return `${this.get('host')}/${this.namespace}/${newURL}`;
    }
    return this._super(...arguments);
  },

  /**
   *This method has been overridden as the web services for Rappi backend do not follow the REST and JSON<br>
   * architecture provided by the client.
   */
    deleteRecord(store, type, snapshot) {
    if (this.pathForType(type.modelName) === "lists") {
      var id = snapshot.id;
      var url = `${this.get('host')}/${this.namespace}/${this.pathForType(type.modelName)}?id=${id}`;
      return this.ajax(url, "DELETE");
    }
    return this._super(...arguments);
  },

  /**
   *This method has been overridden as the web services for Rappi backend do not follow the REST and JSON<br>
   * architecture provided by the client.
   */
    createRecord(store, type, snapshot) {
    var data = {};
    var serializer = store.serializerFor(type.modelName);
    var url = this.buildURL(type.modelName, null, snapshot, 'createRecord');

    serializer.serializeIntoHash(data, type, snapshot, {includeId: true});

    return this.ajax(url, "POST", {data: data[type.modelName]});
  },

  /**
   * This method has been overridden as the web services for Rappi backend do not follow the REST and JSON<br>
   * architecture provided by the client.
   */
    updateRecord(store, type, snapshot) {
    var data = {};
    var serializer = store.serializerFor(type.modelName);

    serializer.serializeIntoHash(data, type, snapshot, {includeId: true});

    var id = snapshot.id;
    var url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');
    url = this.get('host') + "/" + this.namespace + "/" + this.pathForType(type.modelName);
    return this.ajax(url, "PUT", {data: data[type.modelName]});
  },
  generatedDetailedMessage: function (status, headers, payload) {
    var shortenedPayload;
    var payloadContentType = headers["Content-Type"] || "Empty Content-Type";

    if (payloadContentType === "text/html" && payload.length > 250) {
      shortenedPayload = "[Omitted Lengthy HTML]";
    } else {
      shortenedPayload = payload;
    }
    return JSON.stringify(payload);
  }
});
