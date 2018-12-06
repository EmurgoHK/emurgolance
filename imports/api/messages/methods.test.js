import { chai, assert } from "chai";
import { Meteor } from "meteor/meteor";

import { Messages } from "./messages";

import "./methods";

import { callWithPromise } from "/imports/api/utilities";
import { Notifications } from "../notifications/both/notificationsCollection";
import { addMessageRoom } from "../messageRooms/methods";
import { MessageRooms } from "../messageRooms/messageRooms";

describe("Message methods", () => {
  beforeEach(() => {
    Meteor.userId = () => "test-user"; // override the meteor userId, so we can test methods that require a user
    Meteor.user = () => ({ profile: { name: "Test User", hourlyRate: 2000 } });
    Meteor.users.findOne = filter => ({
      _id: filter && filter._id,
      profile: { name: "Test User", hourlyRate: 2000 },
      moderator: filter && filter._id && filter._id.startsWith("mod")
    }); // stub user data as well
  });

  afterEach(function() {
    for (const room of MessageRooms.find({
      $or: [{ owner: Meteor.userId() }, { name: "test user messages" }]
    }).fetch()) {
      Messages.remove({
        roomId: room._id
      });

      Notifications.remove({
        from: room.name
      });
      MessageRooms.remove(room._id);
    }
  });

  it("users can't message non-existent rooms", async () => {
    try {
      await callWithPromise("sendMessage", {
        roomId: "nopeTestRoom",
        message: "Test Users Messages"
      });
      assert.fail("Did not throw");
    } catch (ex) {
      assert.equal(ex.message, "Message room not found. [Error.]");
    }
  });

  it("users can send messages to their rooms", async () => {
    const roomId = addMessageRoom.run({ name: "test user messages" });
    await callWithPromise("sendMessage", {
      roomId,
      message: "Test Users Message"
    });
    const messages = Messages.find({roomId}).fetch();
    assert.lengthOf(messages, 1);
    
    const msg = messages[0];
    assert.equal(msg.senderId, Meteor.userId());
    assert.equal(msg.message, "Test Users Message");
  });

  it("mods can send messages to any room", async () => {
    const roomId = addMessageRoom.run({ name: "test user messages" });
    Meteor.userId = () => "mod-test-user";
    await callWithPromise("sendMessage", {
      roomId,
      message: "Test Users Messages"
    });
  });

  it("users can't send messages to any room", async () => {
    const roomId = addMessageRoom.run({ name: "test user messages" });
    Meteor.userId = () => "test-user2";
    try {
      await callWithPromise("sendMessage", {
        roomId,
        message: "Test Users Messages"
      });
      assert.fail("Did not throw");
    } catch (ex) {
      assert.equal(
        ex.message,
        "You can't send messages in this room. [Error.]"
      );
    }
  });

  it("room members are notified of a messages", async () => {
    const ownerId = Meteor.userId();
    const roomId = addMessageRoom.run({ name: "test user messages" });
    Meteor.userId = () => "mod-test-user";
    await callWithPromise("sendMessage", {
      roomId,
      message: "Test message"
    });
    
    const notifications = Notifications.find({
      from: "test user messages"
    }).fetch();

    assert.lengthOf(notifications, 1);
    assert.equal(notifications[0].userId, ownerId);
  });
});
