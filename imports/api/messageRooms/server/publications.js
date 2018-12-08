import { Meteor } from "meteor/meteor";

import { isModerator } from "../../users/methods";
import { MessageRooms } from "../messageRooms";
import { Messages } from "../../messages/messages";

Meteor.publish("messageRooms", function() {
  const userId = Meteor.userId();
  return isModerator(userId)
    ? MessageRooms.find({})
    : MessageRooms.find({
        $or: [{ owner: userId }, { members: userId }]
      });
});

Meteor.publish("messageRooms.item", function(id) {
  const userId = Meteor.userId();
  return isModerator(userId)
    ? MessageRooms.find({ _id: id })
    : MessageRooms.find({
        $and: [{ _id: id }, { $or: [{ owner: userId }, { members: userId }] }]
      });
});

Meteor.publishComposite("messageRooms.withLastMessage", () => {
  return {
    find() {
      const userId = Meteor.userId();
      return isModerator(userId)
        ? MessageRooms.find({})
        : MessageRooms.find({
            $or: [{ owner: userId }, { members: userId }]
          });
    },
    children: [
      { find: (room) => Messages.find({ roomId: room._id }, { limit: 1, sort: { timestamp : -1 } }) },
      { find: (room) => Meteor.users.find({ _id: { $in: room.members } }) },
    ],
  };
});