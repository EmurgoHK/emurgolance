import "./invoices.html";
import "./invoices.scss";

import "../../shared/uploader/uploader";

import { Template } from "meteor/templating";
import { Invoices } from "../../../api/invoices/invoices";
import { Meteor } from "meteor/meteor";
import { isModerator } from "../../../api/users/methods";

Template.invoices.onCreated(function() {
  if (isModerator(Meteor.userId())) this.subscribe("invoices.mod");
  else this.subscribe("invoices.user");
});

Template.invoices.helpers({
  Invoices: () => Invoices,
  fileList: () => Invoices.find({ uploader: FlowRouter.getParam("userId") || Meteor.userId() }),

  userName: () =>
    (FlowRouter.getParam("userId") ? Meteor.users.findOne(FlowRouter.getParam("userId")) : Meteor.user()).profile.name
});

Template.invoices.events({});
