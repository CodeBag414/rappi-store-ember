import Ember from 'ember';
import ENV from 'rappi/config/environment';

const {
  stContent
  } = ENV.storageKeys;

export default Ember.Component.extend({
  lat: null,
  long: null,
  address: null,
  map: null,
  markers: [],
  markersPopup: [],
  init(){
    this._super(...arguments);
  },
  didReceiveAttrs() {
    this._super(...arguments);
    let content = this.storage.get(stContent);
    let codeNumber = content.code === "MX" ? 1 : 0;
    this.lat = this.get('homeLatitude') !== 0 ? this.get('homeLatitude') : ENV.location[codeNumber][content.name].lat;
    this.long = this.get('homeLongitude') !== 0 ? this.get('homeLongitude') : ENV.location[codeNumber][content.name].lng;
    this.address = this.get('address');
  },

  renderMap: function () {
    var myLatLng = {lat: parseFloat(this.lat), lng: parseFloat(this.long)};
    this.map = new window.google.maps.Map(this.$('#map-canvas')[0], {
      zoom: 10,
      center: myLatLng
    });

    var marker = new window.google.maps.Marker({
      position: myLatLng,
      map: this.map,
      title: this.address,
      draggable: this.get('dragAllow')
    });

    this.markers.push(marker);
  }.on('didInsertElement'),

  reRenderMap: function () {
    if (this.markersPopup.length === 0) {
      this.markersPopup = this.markers;
    }
    var myLatLng = {lat: parseFloat(this.lat), lng: parseFloat(this.long)};

    this.map.setCenter(myLatLng);

    if (this.markersPopup.length !== 0) {
      for (var i = 0; i < this.markersPopup.length; i++) {
        this.markersPopup[i].setMap(null);
      }
    }
    var marker = new window.google.maps.Marker({
      position: myLatLng,
      map: this.map,
      title: this.address,
      draggable: this.get('dragAllow')
    });

    this.markerDragEndEvent(marker);

    this.markersPopup.push(marker);

  }.on('didUpdate'),
  markerDragEndEvent: function (marker) {
    var _this = this;
    google.maps.event.addListener(marker, 'dragend', function (event) {
      _this.set("homeLatitude", this.getPosition().lat());
      _this.set("homeLongitude", this.getPosition().lng());
      _this.setAddress(marker.getPosition());
    });
  },
  setAddress: function (pos) {
    new google.maps.Geocoder().geocode({
      latLng: pos
    }, (responses)=> {
      if (responses && responses.length > 0) {
        this.set("address", responses[0].formatted_address);
      } else {
        console.log("fail");
      }
    });
  }
});
