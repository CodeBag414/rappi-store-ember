/* jshint node: true */

module.exports = function (environment) {
  var ENV = {
    modulePrefix: 'rappi',
    podModulePrefix: 'rappi/pod',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    clientId: "nr7IJTVmdVekFqRFVFHJUiDBT3jIwTrAncSE4ux3",
    clientSecret: "o2r4syv0eyhqaSoMryiJqlEUzRDgyRlx4RPGo8NB",
    rappiServerURL: "",
    popularSearchServerURL: "",
    popularSearchEndPointUrl: "rappi/search/products?",
    popularSearchSaveEndPointUrl: "rappi/search/save",
    getPopularSearchUrl: "rappi/search/get?",
    paypal: "rappi/search/paypal",
    serverTokenEndpoint: "",
    profilePicUrl: "api/application-users/profile-pic",
    addCreditCardUrl: "api/paymentez/cc/url-add",
    changePassword: "api/change-password",
    categoryImageURL: "uploads/corridors/medium/",
    googleMapGeocodeUrl: "https://maps.googleapis.com/maps/api/geocode/json",
    "place-autocomplete": {
      key: "AIzaSyApUUuFkU2n7TAVHeniz_GcKPOFGcSvDDU"
    },
    googleAnalytics: {
      webPropertyId: 'UA-64467188-1'
    },
    searchStore: "api/stores/available/2?",
    productSearch: "cms/products-for-ids-and-stores?",
    order: "api/orders",
    orderStatus: "api/orders/status",
    storage: 'api/stores/by-location-and-time/2?',
    byLocation: 'api/web/stores/by-location',
    confirmCode: 'api/sms/confirm-code',
    sendCode: 'api/sms/send-confirmation-code',
    cardList: 'api/paymentez/cc?env=pro',//'rappi/search/credit/card/list',
    resolveCountry: 'api/resolve-country?',
    facebookClientId: '346132112241554',
    facebookClientSecret: '493ea10d1da9323950d53f1e68be2c29',
    facebookRedirectUri: 'https://www.rappi.com/',
    facebookAccesstoken: 'https://graph.facebook.com/v2.3/oauth/access_token?',
    facebookDetails: 'https://graph.facebook.com/me?fields=email,name,id,gender,age_range,first_name,last_name,locale,name_format,security_settings,timezone&access_token=',
    loginWithFacebook: 'api/login/facebook',
    chargesZone: 'api/charges/zone/',
    whimList: 'api/whims/list',
    sendChatMessage: 'api/chat/send',
    chatHistory: 'api/chat/history',
    redeemCoupon: 'api/coupons/redeem',
    getCoupons: 'api/coupons',
    statusApplication: "api/status/application?version_number=2.8&device=2&platform=android",
    paypalAutoLogin: "https://lupita.co/request/paypal/user/",
    paypalAuthorize: "https://lupita.co/request/paypal/user/login/",
    paypalAuthWithFacebook: "https://lupita.co/request/paypal/user/facebook/login/",
    currentCountry: 'https://ipapi.co/json/?key=9930eb76d52cd0e84170ce9d24e9e3985ae62be3',
    payPaypal: 'https://lupita.co/request/paypal/pay/',
    refundPaypal: 'https://lupita.co/request/paypal/refund',
    algoliaGetRestaurants: 'https://lupita.co/co/bog/aircall/request/getRestaurants/',
    algoliaSearchProductsRetaurant: 'https://lupita.co/co/bog/aircall/request/searchProductsRetaurant/',
    paypalLocationId_su: 'QYWDFSPHUC9GJ',
    paypalLocationId_res: 'PH2DQ54LVLB6S',
    rappiWebBaseImage: 'uploads',
    userDetails: 'https://v2.grability.rappi.com//api/application-users',
    applicationUser:'api/application-users',
    "ember-simple-auth": {
      routeAfterAuthentication: null
    },
    zoneOffset: {
      CO: "-05:00",
      MX: "-06:00",
    },
    location: [
      {
        name: "Colombia",
        "Colombia": {
          lat: "4.710989",
          lng: "-74.072092"
        }
      },
      {
        name: "México",
        "México": {
          lat: "19.413558",
          lng: "-99.165189"
        }
      }
    ],
    locationVisible: true,
    ALGOLIA_APPLICATION_ID: "IC74GBC39N",
    ALGOLIA_API_KEY: "60afb4cd3800318da64a64bb30739a9f",
    INDEX_NAME: 'dev_products_co',
    INDEX_NAME_MX: 'dev_products_mx',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    contentSecurityPolicy: {
      'default-src': "'none'",
      'script-src': "'self' 'unsafe-inline' 'unsafe-eval' use.typekit.net connect.facebook.net maps.googleapis.com maps.gstatic.com",
      'font-src': "'self' data: use.typekit.net",
      'connect-src': "'self'",
      'img-src': "'self' www.facebook.com p.typekit.net",
      'style-src': "'self' 'unsafe-inline' use.typekit.net",
      'frame-src': "s-static.ak.facebook.com static.ak.facebook.com www.facebook.com"
    }, moment: {
      includeLocales: ['es', 'fr-ca']
    },
    colombiaSocket: "?user_type=cms&access_token=r909UMHcF6eGEAY1M9xnx4LHlHbQg1xj8L78tveCX0N13vwet2iuaLKaIyfCd2FL",
    mexicoSocket: "?user_type=cms&access_token=r909UMHcF6eGEAY1M9xnx4LHlHbQg1xj8L78tveCX0N13vwet2iuaLKaIyfCd2FL",
    storageKeys: {
      stLat: "st-lat",
      stLng: "st-lng",
      stAddress: "st-address",
      stCountry: "st-selectedCountry",
      stContent: "st-content",
      stStoreType: "st-storeType",
      stShippingCharges: "st-shippingCharges",
      paypalTabId: "paypal_tab_id",
      paypal: "paypal",
      stAddressId: "st-address-id",
      stStoreId: "st-store-id",
    },
    availableStoreTypes: ['bienvenida', 'restaurant', 'courier', 'express', 'restaurant_informal', 'ultraservicio', 'Farmatodo', 'farmacia', 'market_start_dummies', 'bienvenida_hiper', 'super', 'hiper'],
    defaultStoreType: 'super',
    preRenderLat: 4.6786374,
    preRenderLng: -74.05548269999997,
    preRenderContent: {
      "server": "https://v2.grability.rappi.com/",
      "socket": "http://node-rappi2.grability.rappi.com:8080",
      "phone_prefix": "+57",
      "name": "Colombia",
      "code": "CO",
      "countryName": "Colombia",
      'preRender': true
    },
    metaTags: {
      home: {
        title: 'Rappi',
        description: 'DOMICILIO Bogotá Ciudad de México'
      }, supermarket: {
        title: 'Supermercado',
        description: 'Supermercado Frutas y verduras Carnes y mariscos'
      }, express: {
        title: 'Tienda express y cajero',
        description: 'Tienda express y cajero Bebidas Refrigerados'
      }, restaurant: {
        title: 'Restaurantes y cafés',
        description: 'Restaurantes y cafés'
      }, farmacia: {
        title: 'Farmacia y bienestar',
        description: 'Farmacia y bienestar DROGUERÍA LIBRERÍA CUIDADO PERSONAL'
      },
    },
    interComAppId: 'w5374i76',
    accountKitAppID: '1688386154810224',
    accountKitAppSecret: '0a221c063f91444e41fdda0d168f4adc',
    accountKitAccessTokenURL:'https://graph.accountkit.com/v1.1/access_token?grant_type=authorization_code&',
    accountKitMeURL:'https://graph.accountkit.com/v1.1/me?access_token',
  };

  ENV.browserify = {
    tests: true
  };

  ENV.torii = {
    providers: {
      'facebook-oauth2': {
        apiKey: ENV.facebookClientId,
        scope: ["public_profile", "email"]
      }
    }
  };

  if (environment === 'development') {
    ENV.rappiServerURL = "https://v2.grability.rappi.com/";
    ENV.popularSearchServerURL = "https://search.rappi.com";
    ENV.serverTokenEndpoint = "api/login";
    ENV.rappiWebSocketURL = "https://node-rappi2.grability.rappi.com/?user_type=user&access_token=";
    ENV.rappiWebBaseImageColombia = "https://v2.grability.rappi.com/uploads";
    ENV.rappiWebBaseImageMexico = "https://v2.mxgrability.rappi.com/uploads";
    ENV.rappiWebRestaurantImage = "/restaurants/medium/";
    ENV.rappiWebRestaurantBackgroundImage = "/restaurants/web/background/";
    ENV.rappiWebRestaurantLogoImage = "/restaurants/web/logo/";
    ENV.rappiWebRestaurantIconImage = "/restaurants/web/icon/";
    ENV.rappiWebCorridorImage = "/corridors/web/";
    ENV.rappiWebSubcorridorImage = "/subcorridors/web/";
    ENV.locationVisible = true;
    ENV.APP.LOG_TRANSITIONS = true;
    //ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    //ENV.APP.LOG_VIEW_LOOKUPS = true;
    //ENV.facebookAccesstoken = 'https://graph.facebook.com/v2.3/oauth/access_token?client_id=1817705831782917&redirect_uri=http%3A%2F%2Fweb.rappi.com%2F&client_secret=ec00e9d64ebed1f125f059e6765d6e99&code=';
    ENV.facebookRedirectUri = 'http://web.rappi.com/';
    ENV.facebookClientId = '1817705831782917';
    ENV.facebookClientSecret = 'ec00e9d64ebed1f125f059e6765d6e99';
    ENV.torii = {
      providers: {
        'facebook-oauth2': {
          apiKey: '1817705831782917',
          scope: ["public_profile", "email"]
        }
      }
    };
    ENV.payPalClientID = "AdgfGD1qYIJDh4VJoipW0urnQ4y5BWF7uJIC63c9d04MXbhPJikdNLb5xD63xK_b2ZTXhXFHp-wReGaX";
    ENV.payPalSecret = "EIiNiop_bol5KEOC6HBfOkZyY2zvvZzIgY2OPOjofP06NrzkcepgcLgUI2DlnGpF66L_MVgP8VgYYJH1";
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    ENV.rappiServerURL = "https://v2.grability.rappi.com/";
    ENV.popularSearchServerURL = "https://search.rappi.com";
    ENV.serverTokenEndpoint = "api/login";
    ENV.rappiWebSocketURL = "https://node-rappi2.grability.rappi.com/?user_type=user&access_token=";
    ENV.rappiWebBaseImageColombia = "https://v2.grability.rappi.com/uploads";
    ENV.rappiWebBaseImageMexico = "https://v2.mxgrability.rappi.com/uploads";
    ENV.rappiWebRestaurantImage = "/restaurants/medium/";
    ENV.rappiWebRestaurantBackgroundImage = "/restaurants/web/background/";
    ENV.rappiWebRestaurantLogoImage = "/restaurants/web/logo/";
    ENV.rappiWebRestaurantIconImage = "/restaurants/web/icon/";
    ENV.rappiWebCorridorImage = "/corridors/web/";
    ENV.rappiWebSubcorridorImage = "/subcorridors/web/";
  }

  return ENV;
}
;
