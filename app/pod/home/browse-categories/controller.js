import Ember from 'ember';
import ENV from 'rappi/config/environment';

export default Ember.Controller.extend({
  url: `${ENV.rappiServerURL}/${ENV.categoryImageURL}`

});
