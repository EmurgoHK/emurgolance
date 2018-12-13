import { Meteor } from "meteor/meteor";
import { Updates } from "../updates";

Meteor.publish("updates.last", function({ api, callType }) {
  return Updates.find({ api, callType }, { sort: { timestamp: -1 }, limit: 1 });
});
