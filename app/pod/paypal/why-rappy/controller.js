import Ember from 'ember';
import ENV from 'rappi/config/environment';

export default Ember.Controller.extend({
  content: null,
  init() {
    this._super(...arguments);
    Ember.$.ajax({
      type: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      url: `${ENV.rappiServerURL}/api/embedded/why_rappi`,
    }).then((response)=> {
      document.getElementById('why-rappy').innerHTML = response;
    }).fail((err)=> {
      console.log("err>", err);
    });
  }
});
