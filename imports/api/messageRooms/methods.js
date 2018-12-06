import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";

import { sendNotification } from '../notifications/both/notificationsMethods';
import { isModerator } from "../users/methods";

import { MessageRooms } from "./messageRooms";

/**
 * Adds a message room with the name as passed and the current user as the owner and only member
 */
export const addMessageRoom = new ValidatedMethod({
  name: "addMessageRoom",
  validate: new SimpleSchema({
    name: {
      type: String,
      optional: false
    },
    notifyMods: {
      type: Boolean,
      optional: true
    }
  }).validator({
    clean: true
  }),
  run({ name, notifyMods }) {
    if (!Meteor.userId()) {
      throw new Meteor.Error("Error.", "You have to be logged in.");
    }

    return MessageRooms.insert({
      owner: Meteor.userId(),
      members: [Meteor.userId()],
      notifyMods: !!notifyMods,
      name
    });
  }
});

/**
 * Returns if the user with the passed id can send a message to the room
 * @param {String} userId UserId
 * @param {String} roomId RoomId
 */
export function canMessage(userId, roomId) {
  const room = MessageRooms.findOne(roomId);

  if (!room) 
    throw new Meteor.Error("Error.", "Message room not found.");

  return room.members.includes(userId) || !!isModerator(userId);
}

/**
 * Sends a notification to all members of the room and the moderators if enabled
 * @param {String} roomId
 */
export function notifyRoom(roomId, sender, type, notificationText) {
  const room = MessageRooms.findOne(roomId);

  if (!room) throw new Meteor.Error("Error.", "Message room not found.");

  const usersToNotify = room.notifyMods
    ? room.members.concat(...Meteor.users.find({ moderator: true }).fetch().map(a => a._id))
    : room.members;
  for (const mem of new Set(usersToNotify)) {
    if (mem !== sender) {
      sendNotification(
        mem,
        notificationText,
        room.name,
        `/messages/${room._id}`,
        type
      );
    }
  }
}
