import { Meteor } from "meteor/meteor";
import { Invoices } from "../invoices";
import { isModerator } from "../../users/methods";

Meteor.publish("invoices.user", function() {
  if (!Meteor.userId()) {
    throw new Meteor.Error("NotLoggedIn");
  }

  return Invoices.find({ uploader: Meteor.userId() });
});

Meteor.publish("invoices.mod", function() {
  if (!isModerator(Meteor.userId())) {
    throw new Meteor.Error("NotModerator");
  }

  return Invoices.find({});
});
