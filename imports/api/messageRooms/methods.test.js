import { chai, assert } from "chai";
import { Meteor } from "meteor/meteor";

import { MessageRooms } from "./messageRooms";

import { canMessage, notifyRoom } from "./methods";

import { callWithPromise } from "/imports/api/utilities";
import { Notifications } from "../notifications/both/notificationsCollection";

describe("MessageRoom methods", () => {
  beforeEach(() => {
    Meteor.userId = () => "test-user"; // override the meteor userId, so we can test methods that require a user
    Meteor.user = () => ({ profile: { name: "Test User", hourlyRate: 2000 } });
    Meteor.users.findOne = filter => ({
      _id: filter && filter._id,
      profile: { name: "Test User", hourlyRate: 2000 },
      moderator: filter && filter._id.startsWith("mod")
    }); // stub user data as well
    Meteor.users.find = filter => {
      if (filter.moderator) {
        return {
          fetch: () => [
            {_id: 'mod-test-user', profile: { name: "Mod Test User", hourlyRate: 2000 }, moderator: true},
          ],
        };
      } else {
        return {
          fetch: () => [
            {_id: 'test-user', profile: { name: "Test User", hourlyRate: 2000 }, moderator: false},
            {_id: 'anotherUser', profile: { name: "Not Test User", hourlyRate: 2000 }, moderator: false},
            {_id: 'mod-test-user', profile: { name: "Mod Test User", hourlyRate: 2000 }, moderator: true},
          ],
        };
      }
    };
  });

  afterEach(function() {
    for (const room of MessageRooms.find({ owner: Meteor.userId() }).fetch()) {
      Notifications.remove({
        from: room.name
      });
      MessageRooms.remove(room._id);
    }
  });

  it("users can add rooms", async () => {
    await callWithPromise("addMessageRoom", { name: "Test Users Messages" });
    assert.ok(MessageRooms.findOne({ name: "Test Users Messages" }));
  });

  it("users can message rooms they add", async () => {
    const roomId = await callWithPromise("addMessageRoom", {
      name: "Test Users Messages"
    });
    assert.isTrue(canMessage(Meteor.userId(), roomId));
  });

  it("users can't message rooms they are not members of", async () => {
    const roomId = await callWithPromise("addMessageRoom", {
      name: "Test Users Messages"
    });
    assert.isFalse(canMessage("anotherUser", roomId));
  });

  it("mods can message any room", async () => {
    const roomId = await callWithPromise("addMessageRoom", {
      name: "Test Users Messages"
    });
    assert.isTrue(canMessage("modUserId", roomId));
  });

  it("can notify rooms, but not the from", async () => {
    const roomId = await callWithPromise("addMessageRoom", {
      name: "Test Users Messages"
    });
    notifyRoom(roomId, Meteor.userId(), "test-notification", "testMessage");

    const notifications = Notifications.find({
      from: "Test Users Messages"
    }).fetch();
    assert.lengthOf(notifications, 0);
  });

  it("can notify rooms with mods, but not the sender", async () => {
    const roomId = await callWithPromise("addMessageRoom", {
      name: "Test Users Messages",
      notifyMods: true,
    });
    notifyRoom(roomId, Meteor.userId(), "test-notification", "testMessage");

    const notifications = Notifications.find({
      from: "Test Users Messages"
    }).fetch();
    assert.lengthOf(notifications, 1);
  });
});
