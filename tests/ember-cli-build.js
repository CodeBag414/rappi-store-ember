/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  var app = new EmberApp(defaults, {
    // Add options here
    babel: {
      compact: false
    },
    fingerprint: {
      enabled: false
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.
  app.import('bower_components/bootstrap/dist/css/bootstrap.css');
  app.import('bower_components/bootstrap/dist/css/bootstrap-theme.css');
  app.import('bower_components/bootstrap/dist/js/bootstrap.js');
  app.import('bower_components/algoliasearch/dist/algoliasearch.js');
  app.import('vendor/font-awesome/css/font-awesome.min.css');
  app.import('bower_components/jquery/dist/jquery.min.js');
  app.import('bower_components/perfect-scrollbar/js/perfect-scrollbar.js');
  app.import('bower_components/perfect-scrollbar/css/perfect-scrollbar.css');
  app.import('vendor/jquery.menu-aim.js');
  app.import('vendor/jquery-zoom.js');
  app.import('vendor/owl-carousel/owl.carousel.css');
  app.import('vendor/owl-carousel/owl.theme.css');
  app.import('vendor/owl-carousel/owl.carousel.min.js');
  app.import('bower_components/waypoints/lib/noframework.waypoints.min.js');
  return app.toTree();
};