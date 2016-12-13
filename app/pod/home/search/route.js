import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stLat,
  stLng,
  stStoreType
  } = ENV.storageKeys;

export default Ember.Route.extend({
  serverUrl: Ember.inject.service('server-url'),
  productSearched: "",
  session: Ember.inject.service('session'),
  setupController: function (controller, model) {
    this._super(controller, model);
    Ember.$("#productSearch").val(this.get('productSearched'));
    controller.set("product", this.get('productSearched'));
    window.scrollTo(0, 0);
  }, model(params){
    let productId = params.productId;
    let storeType = params.storeType;
    let productName = params.product;
    let currentUrl = this.serverUrl.getUrl();

    this.set('productSearched', productName);
    this.set('storeType', storeType);
    let result = [];
    let lat = this.storage.get(stLat);
    let lng = this.storage.get(stLng);
    if (Ember.isEmpty(lat) || Ember.isEmpty(lng) || Ember.isEmpty(storeType)) {
      this.transitionTo('index');
      return;
    }
    if (storeType === "farmacia") {
      storeType = "Farmatodo";
    }

    if (storeType === "rappicode") {
      let session = this.get('session');
      let accessToken;
      if (session.isAuthenticated) {
        accessToken = session.get('data.authenticated.access_token');
      } else {
        this.transitionTo('index');
        return;
      }
      return new Ember.RSVP.Promise(function (resolve, reject) {
        let url = `${currentUrl}${ENV.rappicodeAPIUrl}`;
        Ember.RSVP.hashSettled({
          searchedPruduct: Ember.$.ajax({
            type: 'POST',
            url: url,
            data: `{"code": "${productName}", "lat": ${lat}, "lng": ${lng}}`,
            crossDomain: true,
            dataType: 'json',
            contentType: "application/json",
            beforeSend: function(xhr) {
              xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
            },
          }).then((rsp)=> {
            if (Ember.isPresent(rsp)) {
              result = rsp.result.products;              
              for (var key in result) {
                result[key].id = result[key].store_id;
                result[key].imagelow = ENV.rappiServerURL + ENV.rappiWebBaseImage + '/' + result[key].image;
                result[key].presentation = result[key].unit_type;
              }
            }
            return result;
          }).fail((err)=> {
            console.log("err>> is ...", err);
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
    } else {
      return new Ember.RSVP.Promise(function (resolve, reject) {
        Ember.RSVP.hashSettled({
          searchedPruduct: Ember.$.getJSON(`${currentUrl}${ENV.storage}lat=${lat}&lng=${lng}&store_types=${storeType}`)
            .then((rsp)=> {
              if (Ember.isPresent(rsp)) {
                let stores = [];
                for (var key in rsp.stores) {
                  if (rsp.stores[key].store_id > 0) {
                    stores.push(rsp.stores[key].store_id.toString());
                  }
                }
                return Ember.$.getJSON(`${currentUrl}${ENV.productSearch}ids=${productId}&stores=${stores}`);
              }
            }).then((rsp)=> {
              if (Ember.isPresent(rsp)) {
                result = rsp;
                result.forEach((prod)=> {
                  prod.id = prod.store_id + "_" + prod.id;
                });
              }
              console.log("result", result);
              return result;
            }).fail((err)=> {
              console.log("err>> is ...", err);
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
  }, afterModel() {
    let storeType = this.get('storeType');
    let productSearched = this.get('productSearched');
    let pageLookingFor;
    switch (storeType) {
      case 'super':
        pageLookingFor = 'supermarket';
        break;
      default:
        pageLookingFor = storeType;
    }
    this.get('meta').update({
      title: `${ENV.metaTags[pageLookingFor].title} - ${productSearched}`,
      description: `${ENV.metaTags[pageLookingFor].title} ${productSearched}`
    });
  },
  actions: {
    loading(transition) {
      let controller = this.controllerFor('home');
      let homeController = this.controllerFor('index');
      controller.set('currentlyLoading', true);
      homeController.set('searching', true);
      transition.promise.finally(function () {
        controller.set('currentlyLoading', false);
        homeController.set('searching', false);
      });
    }
  }
});
