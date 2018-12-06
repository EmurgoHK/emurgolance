import "./userNameDisplay.html";
import "./userNameDisplay.scss";

Template.userNameDisplay.onCreated(function() {
  this.userObj = new ReactiveVar(undefined);

  this.autorun(() => {
    const data = Template.currentData();
    
    if (data.userId) this.userObj.set(Meteor.users.findOne(data.userId));
    else this.userObj.set(data.user);
  });
});

Template.userNameDisplay.helpers({
  profileUrl: () => {
    const user = Template.instance().userObj.get();
    if (Meteor.user().moderator && user) return `/users/${user._id}`;

    return "";
  },
  userName: () => {
    const user = Template.instance().userObj.get();

    if (!user) return undefined;
    return (
      (user.profile && user.profile.name) ||
      user.username ||
      user.emails[0] ||
      "Unkown"
    );
  }
});
