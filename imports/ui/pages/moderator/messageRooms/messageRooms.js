import './messageRooms.html'
import './messageRooms.scss'
import { MessageRooms } from '../../../../api/messageRooms/messageRooms';
import { Messages } from '../../../../api/messages/messages';

Template.messageRooms.onCreated(function() {
  this.subscribe('messageRooms.withLastMessage');
});

Template.messageRooms.helpers({
  messageRooms: () => MessageRooms.find({}),
  lastMessageText: (roomId) => {
    const msg = Messages.findOne({ roomId })
    return msg && msg.message;
  },
  lastMessageDate: (roomId) => {
    const msg = Messages.findOne({ roomId })
    return msg && msg.timestamp 
      ? new Date(msg.timestamp).toLocaleString()
      : 'Unkown time';
  },
  lastMessageUser: (roomId) => {
    const msg = Messages.findOne({ roomId })
    return msg && Meteor.users.findOne(msg.senderId);
  },
  userName: (userId) => getUserName(userId),
});
