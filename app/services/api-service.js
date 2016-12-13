import Ember from 'ember';

export default Ember.Service.extend({

  get(url, token) {
    return new Promise((resolve, reject)=> {
      let params = {
        type: 'GET',
        dataType: 'json',
        url: url
      };
      params = this.setHeader(params, token);
      this.apiCall(params, resolve, reject);
    });
  },
  post(url, data, token) {
    return new Promise((resolve, reject)=> {
      let params = {
        type: 'POST',
        dataType: 'json',
        url: url,
        data: JSON.stringify(data)
      };
      params = this.setHeader(params, token);
      this.apiCall(params, resolve, reject);
    });
  },
  put(url, data, token){
    return new Promise((resolve, reject)=> {
      let params = {
        type: 'PUT',
        dataType: 'json',
        url: url,
        data: JSON.stringify(data)
      };
      params = this.setHeader(params, token);
      this.apiCall(params, resolve, reject);
    });

  },
  delete(url, token, data) {
    return new Promise((resolve, reject)=> {
      let params = {
        type: 'DELETE',
        dataType: 'json',
        url: url
      };
      if (data) {
        params['data'] = JSON.stringify(data);
      }
      params = this.setHeader(params, token);
      this.apiCall(params, resolve, reject);
    });
  },
  auth(url, data, clientId, secret) {
    return new Promise((resolve, reject)=> {
      let params = {
        type: 'POST',
        url: url,
        data: data
      };
      const base64ClientId = window.btoa(clientId.concat(':').concat(secret));
      params.headers = {
        "Authorization": `Basic ${base64ClientId}`,
        "Content-Type": "x-www-form-unlencoded"
      }
      this.apiCall(params, resolve, reject);
    });
  },
  setHeader(params, token) {
    if (token !== null || token !== undefined) {
      params.headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };
    }
    return params;
  },
  apiCall(params, resolve, reject) {
    Ember.$.ajax(params)
      .then((resp)=> {
        resolve(resp);
      })
      .fail((error)=> {
        reject(error);
      });
  }
});
