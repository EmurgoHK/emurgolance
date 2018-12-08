import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";

import { Messages } from "./messages";
import { canMessage, notifyRoom } from "../messageRooms/methods";

export const sendMessage = new ValidatedMethod({
  name: "sendMessage",
  validate: new SimpleSchema({
    roomId: {
      type: String,
      optional: false
    },
    message: {
      type: String,
      optional: false
    }
  }).validator({
    clean: true
  }),
  run({ roomId, message }) {
    if (!Meteor.userId()) {
      throw new Meteor.Error("Error.", "You have to be logged in.");
    }

    if (!canMessage(Meteor.userId(), roomId)){
      throw new Meteor.Error("Error.", "You can't send messages in this room.");
    }

    const messageId = Messages.insert({
      roomId,
      senderId: Meteor.userId(),
      message,
      timestamp: new Date().getTime(),
    });

    notifyRoom(roomId, Meteor.userId(), 'new-message', 'New message');
    
    return messageId;
  }
});
