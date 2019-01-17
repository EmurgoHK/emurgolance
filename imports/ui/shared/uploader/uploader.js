import "./uploader.html";
import "./uploader.scss";

import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";

import { notify } from "../../../modules/notifier";

/*
Uploader is a shared component used on a lot of templates
When used, it accepts the following optional parameters: 
- files (fsFile) - An array of already uploaded files to show in the preview element
- id (String) - Unique id of the uploader component. This param is only used if you want to have more than one uploader component on a single page.
- showFileList (boolean) - shows or hide fileList
- collection (fsCollection) - collection to use to save files
- fileAdded (function) - a callback to call when a file has been added to the db
- deleteFile (function) - a callback to call when the users click the file delete button

Only modify the uploader code below if you're modifying the uplaoder itself (e.g. extending its functionality, adding new features, etc)
In other cases, if you want to change what's done with uploaded files, modify the template that's using the uploader and not the uploader itself
*/
Template.uploader.onCreated(function() {
  this.data = this.data || {};

  this.id = this.data.id || "default";
});

Template.uploader.helpers({
  files: () => Template.currentData().collection.find({ _id: { $in: Template.currentData().files.map(a => a._id) } }),
  id: () => Template.instance().id,
  isPDF: file => file.extension().toLowerCase() === "pdf",
  showDelete: file => !!Template.currentData().fileDelete && file.isUploaded()
});

Template.uploader.events({
  "change .fileInput": (event, templateInstance) => {
    const file = event.target.files[0];

    if (file) {
      var files = event.target.files;
      for (var i = 0, ln = files.length; i < ln; i++) {
        const fsFile = new FS.File(event.target.files[i]);
        fsFile.uploader = Meteor.userId();
        Template.currentData().collection.insert(
          fsFile,
          // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
          (err, data) => {
            if (err) {
              notify(err.reason || err.message, "error");
            } else {
              if (Template.currentData().fileAdded) {
                Template.currentData().fileAdded();
              }
            }
          }
        );
      }
    }
  },

  "click .deleteFile": (event, templateInstance) => {
    Template.currentData().fileDelete();
  }
});
