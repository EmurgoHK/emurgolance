import { Meteor } from "meteor/meteor";
import { Issues } from "../issues";

Meteor.publish("issues", function() {
  return Issues.find({});
});

Meteor.publish("issues.repo", function() {
  return Issues.find({}, { fields: { repoId: 1 } });
});
