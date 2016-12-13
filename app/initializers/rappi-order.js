import RappiOrderService from '../services/rappi-order';
import Ember from 'ember';

export function initialize(application) {
  let rappiOrder = RappiOrderService.create({
    content: Ember.A()
  });

  application.register('rappiOrder:main', rappiOrder, {instantiate: false});
  application.inject('controller', 'rappiOrder', 'rappiOrder:main');
  application.inject('component', 'rappiOrder', 'rappiOrder:main');
  application.inject('route', 'rappiOrder', 'rappiOrder:main');
  application.inject('service', 'rappiOrder', 'rappiOrder:main');
}

export default {
  name: 'rappi-order',
  initialize
};
