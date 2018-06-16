import { isModerator } from '/imports/api/users/methods'

Template.registerHelper('isModerator', () => isModerator(Meteor.userId()))
