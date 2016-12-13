import uriService from '../services/location-service';

export function initialize(application) {
  let locationService = uriService.create();

  application.register('locationService:main', locationService, {instantiate: false});
  application.inject('controller', 'locationService', 'locationService:main');
  application.inject('component', 'locationService', 'locationService:main');
  application.inject('route', 'locationService', 'locationService:main');
  application.inject('service', 'locationService', 'locationService:main');
  application.inject('adapter', 'locationService', 'locationService:main');
}

export default {
  name: 'location-service',
  initialize
};
