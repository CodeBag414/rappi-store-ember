import Ember from 'ember';
import ENV from 'rappi/config/environment';

export default Ember.Service.extend({
  url: `${ENV.rappiServerURL}`,
  payPalENV: false,
  showCountry: false,
  dataByCountry: {},
  socketURL: `${ENV.rappiWebSocketURL}`,
  currentUrl(content) {
    if (content !== undefined) {
      this.set("url", content.server);
      let socketURL = `${content.socket}${ENV.colombiaSocket}`;
      if (content.code === 'MX') {
        socketURL = `${content.socket}${ENV.mexicoSocket}`;
      }

      this.set("socketURL", socketURL);
      return content.server;
    }
    /*data by country */
    this.setdataByCountry();
    return this.get("url");
  },
  setdataByCountry(callback) {
    Ember.$.ajax({
      type: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      url: `${this.getUrl()}api/data-by-country`,
    }).then((resp)=> {
      let formatedData = {};
      resp.forEach(function (data) {
        formatedData[data.key] = data.value;
      });
      this.set("dataByCountry", formatedData);
      if (callback) {
        callback();
      }

    }).fail((err)=> {
      console.log("err>", err);
      if (callback) {
        callback();
      }

    });
  },
  redeemCoupon(code, lat, lng, store_type, purchase_type, accessToken, callback) {
    Ember.$.ajax({
      type: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      data: JSON.stringify({
        "code": code,
        "lat": lat,
        "lng": lng,
        "store_types": [store_type],
        "purchase_type": purchase_type
      }),
      url: `${ENV.rappiServerURL}${ENV.redeemCoupon}`,
    }).then((resp)=> {
      callback(resp);
    }).fail((err)=> {
      callback(err);
    });
  },
  getCoupons(accessToken, callback) {
    Ember.$.ajax({
      type: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      url: `${ENV.rappiServerURL}${ENV.getCoupons}`,
    }).then((resp)=> {
      callback(resp);
    }).fail((err)=> {
      callback(err);
    });
  },
  getUrl() {
    return this.get("url");
  },
  isPayPalENV() {
    return this.get("payPalENV");
  }, setPayPalENV() {
    this.set("payPalENV", true);
    this.set("showCountry", false);
  },
  getSocketURL() {
    return this.get("socketURL");
  },
  getDataByCountry() {
    return this.get("dataByCountry");
  },
  pushPayLoad(payLoad) {
    this.set('url', payLoad.serverURL);
    this.set('socketUrl', payLoad.socketURL);
    this.set('dataByCountry', payLoad.dataByCountry);
    this.set('payPalENV', payLoad.payPalENV);
  },
  _dumpToLocalStorage: Ember.observer('url', 'socketUrl', 'dataByCountry', function () {
    window.localStorage.setItem('serverInfo', JSON.stringify({
      "payPalENV": this.get("payPalENV"),
      "serverURL": this.get("url"),
      "socketURL": this.get("socketURL"),
      "dataByCountry": this.get("dataByCountry")
    }));
  })
});
