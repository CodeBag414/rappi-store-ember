import Ember from 'ember';
import config from './config/environment';
import googlePageview from './mixins/google-pageview';

const Router = Ember.Router.extend(googlePageview, {
  location: config.locationType,
});

Router.map(function () {
  this.route('home', function () {
    this.route('productdetail', {path: 'productdetail/:product_id'});
    this.route('my-accounts', function () {
      this.route('profile');
      this.route('cards');
      this.route('change-password');
      this.route('address');
    });
    this.route('why-rappy');
    this.route('corridor', {path: 'corredor/:corridor_id'});
    this.route('subcorridor', {path: 'subcorredor/:subcorridor_id'});
    this.route('search', {path: 'search/:storeType/:productId/:product'});
    this.route('whims-and-desires');
    this.route('place-and-product', {path: 'place-and-product/:keyword'});
    this.route('popular-search', {path: 'popular-search/:storeType'});
    this.route('browse-categories');
    this.route('my-list', function () {
      this.route('lists');
    });
    this.route('restaurant');
    this.route('store', {path: '/'}, function () {
      this.route('index', {path: 'tienda/:store_id'});
      this.route('all', {path: 'tienda/:store_id/all'});
    });
    this.route('tc');
    this.route('burgerday');
    this.route('lists');
    this.route('list', {path: 'list/:list_id'});
  });

  //for every undefined route
  // this route should be defined after all root
  this.route('no_route_found', {path: "*path"});
  this.route('order', function () {
    this.route('list');
  });
  this.route('my-lists', function () {
    this.route('lists');
  });
  this.route('login');
  this.route('application-loading');
  this.route('paypal', function () {
    this.route('index', {path: '/:storeType'});
    this.route('store', {path: '/'}, function () {
      this.route('index', {path: 'tienda/:store_id'});
      this.route('all', {path: 'tienda/:store_id/all'});
    });
    this.route('corridor', {path: 'corredor/:corridor_id'});
    this.route('subcorridor', {path: 'subcorredor/:subcorridor_id'});
    this.route('search', {path: 'search/:storeType/:productId/:product'});
    this.route('why-rappy');
    this.route('my-accounts', function() {
      this.route('profile');
      this.route('change-password');
      this.route('address');
      this.route('cards');
    });
  });
  this.route('legal', function() {
    this.route('terms',{path:'terms/:countryCode'});
    this.route('privacy',{path:'privacy/:countryCode'});
  });
  this.route('application-error');
  this.route('order-track', {path: 'order-track/:countryName/:token/:orderId'});
  this.route('mexico');
  this.route('download-app');
});

Router.reopen({
  location: 'hashbang',
  notifyGoogleAnalytics: function () {
    return ga('send', 'pageview', {
      'page': this.get('url'),
      'title': this.get('url')
    });
  }.on('didTransition')
});


export default Router;
