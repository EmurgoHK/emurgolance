import { isModerator, approvedUser } from '/imports/api/users/methods'

Template.registerHelper('isModerator', () => isModerator(Meteor.userId()))

Template.registerHelper('unapprovedUser', () => !approvedUser(Meteor.userId()))
