import ServerUrlService from '../services/server-url';
import ENV from 'rappi/config/environment';

export function initialize(application) {
  let serverUrl = ServerUrlService.create();
  if (navigator.userAgent.toLowerCase().indexOf('prerender') >= 0) {
    window.localStorage.setItem(`es__${ENV.storageKeys.stLat}`, ENV.preRenderLat);
    window.localStorage.setItem(`es__${ENV.storageKeys.stLng}`, ENV.preRenderLng);
    window.localStorage.setItem(`es__${ENV.storageKeys.stContent}`, JSON.stringify(ENV.preRenderContent));
  }
  if (window.localStorage.getItem('serverInfo')) {
    let payload = window.localStorage.getItem('serverInfo');
    payload = JSON.parse(payload);
    serverUrl.pushPayLoad(payload);
  } else {
    serverUrl.setdataByCountry(()=> {
    });
  }

  application.register('serverUrl:main', serverUrl, {instantiate: false});
  application.inject('controller', 'serverUrl', 'serverUrl:main');
  application.inject('component', 'serverUrl', 'serverUrl:main');
  application.inject('route', 'serverUrl', 'serverUrl:main');
  application.inject('service', 'serverUrl', 'serverUrl:main');
  application.inject('adapter', 'serverUrl', 'serverUrl:main');
}

export default {
  name: 'server-url',
  initialize
};
