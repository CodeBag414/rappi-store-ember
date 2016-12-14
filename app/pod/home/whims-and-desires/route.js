import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
    stLat,
    stLng,
    stStoreType
    } = ENV.storageKeys;

export default Ember.Route.extend({
  serverUrl: Ember.inject.service('server-url'),
  flashMessages: Ember.inject.service(),
  page: 1,
  perPage: 5,
  actions: {
    loading(transition) {
      let controller = this.controllerFor('home');
      controller.set('currentlyLoading', true);
      transition.promise.finally(function () {
        controller.set('currentlyLoading', false);
      });
    },
    scrollEnd(){
      let controller = this.get('controller');
      if (!controller.get('loading') && !controller.get('noMoreWhims')) {
        this.incrementProperty('page');
        controller.toggleProperty('loading');
        this.send('refreshModel');
      }
    }, refreshModel() {
      var accessToken = this.get('session').get('data.authenticated.access_token');
      let currentUrl = this.serverUrl.getUrl();
      let route = this;
      let controller = this.get('controller');
      this.apiService.get(`${currentUrl}/${ENV.whimList}?page=${this.get('page')}&per_page=${this.get('perPage')}`, accessToken).then(function (data) {
        let model = route.get('controller').get('model');
        route.get('controller');
        if (Ember.isPresent(model) && Ember.isPresent(model.whims) && Ember.isPresent(data)) {
          let whims = model.whims;
          let updatedWhims = [];
          data.forEach((whim)=> {
            let splitedData = whim.text.split('&whim&');
            updatedWhims.pushObject({
              text: whim.text,
              what: splitedData[0],
              where: splitedData[1],
              created: whim.created_at,
              buttonText: "+ agregar a la canasta"
            });
          });
          Ember.set(model, 'whims', whims.concat(updatedWhims));
        } else if (Ember.isEmpty(data)) {
          controller.toggleProperty('noMoreWhims');
        }
        controller.toggleProperty('loading');
        route.get('controller').set('model', model);
      }).catch((err)=> {
        controller.toggleProperty('loading');
        let errMsg = `${err.statusText}: `;
        if (Ember.isPresent(err.responseJSON) && Ember.isPresent(err.responseJSON.errors)) {
          let errors = err.responseJSON.errors;
          Object.keys(errors).forEach((errKey)=> {
            errMsg += ', ' + errors[errKey][0];
          })
        }
        this.get('flashMessages').danger(errMsg);
      });
    }
  },
  setupController: function (controller, model) {
    this._super(controller, model);
    if (this.get('session').get('isAuthenticated')) {
      this.controllerFor('home').set('showAddressList', false);
    } else {
      this.controllerFor('home').set('showAddressPopup', false);
    }
    fbq("track", "ViewContent", {content_name: "whims", content_type: "store"});
    console.log("antojo model", model);
    if (Ember.isPresent(model) && Ember.isPresent(model.whims)) {
      let whims = model.whims;
      let updatedWhims = [];
      whims.forEach((whim)=> {
        let splitedData = whim.text.split('&whim&');
        updatedWhims.pushObject({
          text: whim.text,
          what: splitedData[0],
          where: splitedData[1],
          created: whim.created_at,
          buttonText: "+ agregar a la canasta"
        });
      });
      model.whims = updatedWhims;
    }
    window.scrollTo(0, 0);
  },
  model: function () {
    this.storage.set(stStoreType, "restaurant");
    this.controllerFor('home').set('storeType', "restaurant");
    let authenticated = this.get('session').get('isAuthenticated');
    let currentUrl = this.serverUrl.getUrl();
    if (authenticated) {
      var accessToken = this.get('session').get('data.authenticated.access_token');
      let _this = this;
      return new Ember.RSVP.Promise(function (resolve, reject) {
        Ember.RSVP.hashSettled({
          whims: Ember.$.ajax({
            type: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json"
            },
            dataType: 'json',
            url: `${currentUrl}/${ENV.whimList}?page=${_this.get('page')}&per_page=${_this.get('perPage')}`,
          })
        }).then(function (hashResult) {
          var objectToResolve = {};
          Object.keys(hashResult).forEach(function (key) {
            if (hashResult[key].state === 'fulfilled') {
              objectToResolve[key] = hashResult[key].value;
            } else if (key === 'popularSearch') {
              objectToResolve[key] = [];
            } else {
              reject(hashResult[key]);
            }
          });
          resolve(objectToResolve);
        }).catch(function (error) {
          reject(error);
        });
      });
    }
  }
});
