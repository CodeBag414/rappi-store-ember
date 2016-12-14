import Ember from 'ember';
import ENV from 'rappi/config/environment';

const { stContent }= ENV.storageKeys;

export default Ember.Route.extend({
  session: Ember.inject.service('session'),
  setupController: function (controller, model) {
    this._super(controller, model);
    this.controllerFor('home').send('myAccountAccessed');
    controller.set('parentController', this.controllerFor('home.my-accounts'));
    const content = this.storage.get(stContent);
    controller.set('phone', model.get('phone'));
    controller.set('email', model.get('email'));
    controller.set('phonePrefix', content.phone_prefix);
    controller.set('countryName', content.countryName);
    controller.set('countryFlag', content.code.toLowerCase() === 'co' ? 'ico_flag_colombia.svg' : 'ico_flag_mexico.svg');
    var profilePic = model.get('pic');
    if(profilePic.indexOf("profile-") === -1){
      controller.set('noImage',true);
    }else{
      controller.set('noImage',false);
    }
  },
  model(){
    var currentUser = this.get('session').get('currentUser');
    var tempPhone = currentUser.get("phone");
    if (tempPhone !== undefined) {
      currentUser.set('tempPhone', tempPhone);
    }
    return currentUser;
  }
});
