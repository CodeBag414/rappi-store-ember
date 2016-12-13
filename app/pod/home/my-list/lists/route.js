import Ember from 'ember';

export default Ember.Route.extend({
  setupController: function (controller, model) {
    this._super(controller, model);
    let lists = model;
    let array = {};
    lists.forEach((data)=> {
      array[data.id] = data;
      data["itemNumber"] = data.get("list_product").length;
    });
    controller.set("lists", lists);
    controller.set("formatedList", array);
  },
  model(){
    let lists = this.store.query('list', {purchase_type: "now"});
    return lists;
  },
  actions:{
    loading(transition) {
      let controller = this.controllerFor('home');
      controller.set('currentlyLoading', true);
      transition.promise.finally(function () {
        controller.set('currentlyLoading', false);
      });
    }
  }
});
