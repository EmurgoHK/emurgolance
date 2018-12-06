import { Meteor } from "meteor/meteor";
import { Messages } from "../messages";
import { canMessage } from "../../messageRooms/methods";

Meteor.publish("messages.room", roomId => {
  if (canMessage(Meteor.userId(), roomId))
    return Messages.find({roomId});
});

Meteor.publishComposite("messages.roomWithSenders", roomId => {
  return {
    find() {
      if (canMessage(Meteor.userId(), roomId))
        return Messages.find({roomId}, {sort: {timestamp: 1}});
    },
    children: [
      { find: (message) => Meteor.users.find(message.senderId) },
    ]
  }
});