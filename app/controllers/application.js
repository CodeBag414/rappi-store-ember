/**
 * Created by daffolap-301 on 31/5/16.
 */

import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  actions: {
    logout(){
      this.get('session').invalidate();
    }
  }
});
