import Ember from 'ember';  export default Ember.Controller.extend({
  showPopUp: false,
  inactiveAddressModel: null,
  activeAddressModel: null,
  isError: false,
  errorMessage: null,
  showWarning: false,
  selectAddress: null,
  deleteAddressConfirmation: false,
  addressCount: Ember.computed.alias('model.length'),
  actions: {
    showDialog: function () {
      this.toggleProperty('showPopUp');
    }, getModel: function (addressObj) {
      this.set('inactiveAddressModel', addressObj);
      this.get('model').forEach((address)=> {
        if (address.get('active')) {
          this.set('activeAddressModel', address);
          return;
        }
      });
    }, updateActive: function () {
      window.scrollTo(0, 0);
      this.toggleProperty('showWarning');
    }, deleteAddress: function () {
      var _this = this;
      this.get("selectAddress").destroyRecord().then(function (response) {
        console.info(response);
        _this.toggleProperty('deleteAddressConfirmation');
      }, function (error) {
        _this.set('isError', true);
        _this.toggleProperty('deleteAddressConfirmation');
        var errorJSON = JSON.parse(error.message);
        _this.set('errorMessage', errorJSON.error.message);
      });
    },
    deleteAddressConfirmation: function (addressObj) {
      this.set("selectAddress", addressObj);
      this.toggleProperty('deleteAddressConfirmation');
    },
    closeDeleteAddressConfirmationPopup: function () {
      this.set("selectAddress", null);
      this.toggleProperty('deleteAddressConfirmation');
    },logout() {
      this.get('session').invalidate();
    }
  }
});
