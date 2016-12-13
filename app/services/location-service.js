import Ember from 'ember';

export default Ember.Service.extend({
  getCountry: function() {
    return new Promise((resolve, reject)=> {
      Ember.$.ajax({
        type: 'GET',
        dataType: 'json',
        url: "https://api.ipify.org?format=json"
      })
        .then((resp)=> {
          Ember.$.ajax({
            type: 'GET',
            dataType: 'json',
            url: "http://www.freegeoip.net/json/"+resp.ip
          })
            .then((resp)=> {
              resolve(resp);
            })
            .fail((error)=> {
              reject(error);
            });
        })
        .fail((error)=> {
          reject(error);
        });
    });
  }
});
