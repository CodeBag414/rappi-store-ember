import Ember from 'ember';

export default Ember.Controller.extend({
    message: null,
    countrySelect: 0,
    storeType: null,
    basketOpenned: false,
    searching: false,
    classToTransform: null,
    showPromoBanner:false,
    loading: false,
    noMoreWhims:false,
    actions: {
        setClassToTransform(className){
            this.set('classToTransform', className);
        },
        selectLocation: function (value) {
            this.set('countrySelect', value);
        },
        selectCountry: function () {
            this.set("selectCountryProcess", true);
            this.send("_selectLocation", this.get('countrySelect'));
        }
    }
});
