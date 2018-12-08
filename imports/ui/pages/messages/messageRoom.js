import "./messageRoom.html";
import "./messageRoom.scss";

import { Messages } from "../../../api/messages/messages";
import { MessageRooms } from "../../../api/messageRooms/messageRooms";
import { Notifications } from "../../../api/notifications/both/notificationsCollection";

Template.messageRoom.onCreated(function() {
  this.subscribe("messageRooms.item", FlowRouter.getParam("roomId"));
  this.subscribe("messages.roomWithSenders", FlowRouter.getParam("roomId"));
  this.subscribe("notifications");
});

Template.messageRoom.onRendered(function() {
  this.autorun(() => {
    if (this.subscriptionsReady()) {
      // We fetch messages inside this autorun to have the scrolling animation trigger every time we get a new message.
      Messages.find({ roomId: FlowRouter.getParam("roomId") }).fetch();
      const elem = this.$(".messageList")
      elem.animate({ scrollTop: elem.prop("scrollHeight") + elem.prop("clientHeight")}, 200);
    }
  });
});

Template.messageRoom.helpers({
  room: () => {
    return MessageRooms.findOne({ _id: FlowRouter.getParam("roomId") })
  },
  messageGroups: () => {
    return Messages.find({ roomId: FlowRouter.getParam("roomId") })
      .fetch()
      .reduce((acc, curr) => {
        let last = acc.length > 0 && acc[acc.length - 1];
        if (last && last.senderId === curr.senderId) last.msgs.push(curr);
        else acc.push({ senderId: curr.senderId, timestamp: curr.timestamp, msgs: [curr] });
        return acc;
      }, []);
  },

  msgClasses: msg => {
    return msg.senderId === Meteor.userId() ? "own" : "other";
  },

  showLoader: () => !Template.instance().subscriptionsReady(),
  showEmptyState: (groups) => groups.length === 0,
});

Template.messageRoom.events({
  "submit .messageForm, click .sendMessage": (ev, tpl) => {
    const roomId = FlowRouter.getParam("roomId");
    const message = tpl.$(".messageText").val();
    Meteor.call("sendMessage", { roomId, message }, (err, res) => {
      if (err) console.error(err);
      else {
        tpl.$(".messageText").val("");
      }
    });
    return false;
  },

  "focus .messageForm, click .messageList": (ev, tpl) => {
    if (tpl.subscriptionsReady()) {
      Notifications.find({href: FlowRouter.current().path, read: false}).forEach(notification => {
        // We mark all notifications that point to this page as read if the page is currently open.
        Meteor.call('markNotificationAsRead', {notificationId: notification._id});
      });
    }
  }
});
