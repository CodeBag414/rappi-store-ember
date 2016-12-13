import Ember from 'ember';
import ENV from 'rappi/config/environment';

export default Ember.Route.extend({
  setupController: function (controller, model) {
    this._super(controller, model);
  },
  model(param) {
    let countryName = param.countryName;
    let token = param.token;
    let orderId = param.orderId;
    let location =  ENV.location[0][ENV.location[0].name];
    let zoneOffset = ENV.zoneOffset.CO;
    if("mx" === countryName){
      location = ENV.location[1][ENV.location[1].name];
      zoneOffset = ENV.zoneOffset.MX;
    }
    this.apiService.get(`${ENV.rappiServerURL}/${ENV.resolveCountry}lat=${location.lat}&lng=${location.lng}`, null)
      .then((resp)=> {
        resp.server = resp.server.replace('http://', 'https://');
        resp.countryName = resp.code === 'MX' ? "Mexico" : resp.name;
        this.serverUrl.currentUrl(resp);
        let currentURL = this.serverUrl.getUrl();
        this.apiService.get(`${currentURL}api/orders/status`, token).then((data)=> {
          data.forEach((order)=> {
            if (order.id.toString() === orderId) {
              this.controller.set("zoneOffset", zoneOffset);
              this.controller.set("orderObj", order);
              this.controller.set("loading", false);
              this.controller.send("renderNow");
            }
          });

        }, (err)=> {
          console.log(err);
        });
      }, (error)=> {
        console.log(error);
      });
  },
});
