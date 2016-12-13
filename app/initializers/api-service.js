import uriService from '../services/api-service';

export function initialize(application) {
  let apiService = uriService.create();

  application.register('apiService:main', apiService, {instantiate: false});
  application.inject('controller', 'apiService', 'apiService:main');
  application.inject('component', 'apiService', 'apiService:main');
  application.inject('route', 'apiService', 'apiService:main');
  application.inject('service', 'apiService', 'apiService:main');
  application.inject('adapter', 'apiService', 'apiService:main');
}

export default {
  name: 'api-service',
  initialize
};
