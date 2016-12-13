import Ember from 'ember';

export default Ember.Controller.extend({
  serverUrl: Ember.inject.service('server-url'),
  url: "",
  storeType: null,
  showModalReg: false,
  session: Ember.inject.service('session'),
  restaurantPlatesView: false,
  selectCorridors: [],
  corridors: [],
  corridorsCount: Ember.computed.alias('corridors.length'),
  showAllRestaurantHere: false,
  basketOpenned: false,
  init(){
    this._super(...arguments);
    let currentUrl = this.get("currentUrl");
    this.set("url", currentUrl);
  },
  actions: {
    showDialog: function () {
      this.toggleProperty('showModalReg');
    }, logout(){
      this.get('session').set('data.cart', null);
      this.get('session').invalidate();
    }, click: function () {
      Ember.$('#product-basket').collapse('hide');
      this.set('overflow', false);
      Ember.$("body").css("overflow", "auto");
    },
    productList: function (data) {
      this.set("restaurantsView", false);
      this.set("restaurantPlatesView", true);
      this.set("selectCorridors", data);
    },
    crumbs: function () {
      this.transitionToRoute('paypal.store', this.get('storeType'));
    },
    carousel: function (index) {
      let temp = null;
      let corriVar = [];
      let corridors = this.get("corridors");

      corridors.forEach((data)=> {
        if (index === -1) {
          if (corriVar.length === 0) {
            corriVar.push(corridors[corridors.length - 1]);
          } else {
            corriVar.push(temp);
          }
          temp = data;
        } else if (temp !== null) {
          corriVar.push(data);
        } else {
          temp = data;
        }
      });

      Ember.run.later(this, function () {
        if (index === 1) {
          corriVar.push(temp);
        }
        this.set("corridors", corriVar);
      }, 400);
    }
  }
});
