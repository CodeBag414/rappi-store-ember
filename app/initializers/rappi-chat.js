import RappiChatService from '../services/rappi-chat';
import Ember from 'ember';

export function initialize(application) {
  let rappiChat = RappiChatService.create({
    content: Ember.A()
  });

  application.register('rappiChat:main', rappiChat, {instantiate: false});
  application.inject('controller', 'rappiChat', 'rappiChat:main');
  application.inject('component', 'rappiChat', 'rappiChat:main');
  application.inject('route', 'rappiChat', 'rappiChat:main');
  application.inject('service', 'rappiChat', 'rappiChat:main');
}

export default {
  name: 'rappi-chat',
  initialize
};
