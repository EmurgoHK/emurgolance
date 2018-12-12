import { Meteor } from "meteor/meteor";
import { PullRequests } from "../pullRequests";

Meteor.publish("pullRequests", function() {
  return PullRequests.find({});
});

Meteor.publish("pullRequests.repo", function() {
  return PullRequests.find({}, { fields: { repoId: 1 } });
});
