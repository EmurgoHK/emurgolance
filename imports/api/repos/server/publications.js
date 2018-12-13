import { Meteor } from "meteor/meteor";
import { Repos } from "../repos";

Meteor.publish("repos", function() {
  return Repos.find({});
});
