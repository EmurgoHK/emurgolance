import "./messages.html";
import "./messages.scss";
import { MessageRooms } from "../../../api/messageRooms/messageRooms";

function modMessageRoomName() {
  const user = Meteor.user();
  const name = (user.profile && user.profile.name) || user.username || user.emails[0] || 'User';

  return `${name}'s messages`;
}

Template.messages.onCreated(function() {
  this.subscribe("messageRooms");
  this.autorun(() => {
    if (!this.subscriptionsReady() || !Meteor.userId()) return;
    
    const ownRoom = MessageRooms.findOne({
      owner: Meteor.userId(),
    });
    if (ownRoom) FlowRouter.go(`/messages/${ownRoom._id}`);
  });
});

Template.messages.events({
  "click .createRoom": () => {
    Meteor.call(
      "addMessageRoom",
      { name: modMessageRoomName(), notifyMods: true },
      (err, roomId) => {
        if (err) console.error(err);
        else FlowRouter.go(`/messages/${roomId}`);
      }
    );
  }
});
