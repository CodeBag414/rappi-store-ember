import uriService from '../services/user-service';

export function initialize(application) {
  let apiService = uriService.create();

  application.register('userService:main', apiService, {instantiate: false});
  application.inject('controller', 'userService', 'userService:main');
  application.inject('component', 'userService', 'userService:main');
  application.inject('route', 'userService', 'userService:main');
  application.inject('service', 'userService', 'userService:main');
}

export default {
  name: 'user-service',
  initialize
};
