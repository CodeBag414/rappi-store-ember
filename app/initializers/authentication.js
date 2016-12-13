/**
 * Created by daffolap-301 on 11/6/16.
 */

import rappiAuthenticator from '../authenticators/rappiAuthenticator';

export default {
  name: 'rappi',
  before: 'ember-simple-auth',
  initialize: function (application) {
    application.register('authenticator:rappi', rappiAuthenticator);
    application.inject('component', 'session', 'service:session');
    application.inject('route', 'session', 'service:session');
    application.inject('controller', 'session', 'service:session');
    application.inject('component', 'router', 'router:main');
  }
};
