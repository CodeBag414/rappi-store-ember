import Ember from 'ember';

export default Ember.Service.extend({
  checkAddress: function(lat, long, currentCountry){
    var geocoder = new window.google.maps.Geocoder();
    var latlng = {lat: parseFloat(lat), lng: parseFloat(long)};
    geocoder.geocode({'location': latlng}, function (results) {
      var addressComponents = results[0].address_components;
      addressComponents.forEach((component)=> {
        var componentType = component.types;
        if (componentType[0] === 'country') {
          if (component.long_name === currentCountry) {
            return true;
          } else {
            return false;
          }
        }
      });
    });
  }
});
