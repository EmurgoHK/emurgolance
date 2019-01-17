import os from "os";
import path from "path";
import mkdirp from "mkdirp";

import { isModerator } from "../users/methods";

const parent = Meteor.isServer ? mkdirp.sync(path.join(os.tmpdir(), "emurgolance", "invoices")) : "";

export const Invoices = new FS.Collection("invoices", {
  stores: [new FS.Store.FileSystem("invoices", { path: parent })]
});
Invoices.allow({
  insert: function(userId, fileObj) {
    return !!userId && fileObj.uploader === userId;
  },
  update: function(userId, fileObj) {
    return !!userId && fileObj.uploader === userId;
  },
  download: function(userId, fileObj) {
    return isModerator(userId) || fileObj.uploader === userId;
  }
});
