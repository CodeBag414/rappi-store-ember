/**
 * Created by daffolap-301 on 25/7/16.
 */


import Ember from 'ember';
const {get,set } = Ember;
export default Ember.HashLocation.extend({
  implementation: 'hashbang',

  init: function() {
    set(this, 'location', get(this, 'location') || window.location);
  },

  /**
   @private

   Returns the current `location.hash`, minus the '#' at the front.

   @method getURL
   */
  getURL: function() {
    console.log('geturl',get(this, 'location').hash.substr(2));
    return get(this, 'location').hash.substr(2);
  },

  /**
   @private

   Set the `location.hash` and remembers what was set. This prevents
   `onUpdateURL` callbacks from triggering when the hash was set by
   `HashLocation`.

   @method setURL
   @param path {String}
   */
  setURL: function(path) {
    get(this, 'location').hash = '!'+path;
    set(this, 'lastSetURL', '!'+path);
  },

  /**
   @private

   Register a callback to be invoked when the hash changes. These
   callbacks will execute when the user presses the back or forward
   button, but not after `setURL` is invoked.

   @method onUpdateURL
   @param callback {Function}
   */
  onUpdateURL: function(callback) {
    var self = this;
    var guid = Ember.guidFor(this);

    Ember.$(window).bind('hashchange.ember-location-'+guid, function() {
      Ember.run(function() {
        var path = location.hash.substr(2);
        if (get(self, 'lastSetURL') === path) { return; }

        set(self, 'lastSetURL', null);

        callback(location.hash.substr(2));
      });
    });
  },

  /**
   @private

   Given a URL, formats it to be placed into the page as part
   of an element's `href` attribute.

   This is used, for example, when using the {{action}} helper
   to generate a URL based on an event.

   @method formatURL
   @param url {String}
   */
  formatURL: function(url) {
    return '#!'+url;
  },

  willDestroy: function() {
    var guid = Ember.guidFor(this);

    Ember.$(window).unbind('hashchange.ember-location-'+guid);
  }
});
