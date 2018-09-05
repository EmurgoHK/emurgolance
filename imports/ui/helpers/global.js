import { isModerator, approvedUser } from '/imports/api/users/methods'
import * as helpers from "/imports/modules/helpers.js"

Template.registerHelper('isModerator', () => isModerator(Meteor.userId()))

Template.registerHelper('unapprovedUser', () => !approvedUser(Meteor.userId()))

// converts array to a comma seperated sentence, 
// replaces comma with `and` before the last element
Template.registerHelper("to_sentence", (arr) => {
  return helpers.to_sentence(arr)
})

Template.registerHelper("truncate", (word) => {
	return helpers.truncate(word)
})

// Outputs e.g. 12 days ago or 2 hours ago
Template.registerHelper("showTimeAgo", date => {
  return helpers.showTimeAgo(date)
})

// Outputs e.g. Jan, 2013
Template.registerHelper("showMonthYear", date => {
  return helpers.showMonthYear(date)
})

// Outputs e.g. 12th Jan, 2013
Template.registerHelper("showDayMonthYear", date => {
  return helpers.showDayMonthYear(date)
})

// Outputs August 30th 2014, 5:33:46 pm
Template.registerHelper("showPrettyTimestamp", date => {
  return helpers.showPrettyTimestamp(date)
})

// Outputs August 30th 2014, 5:33:46 pm
Template.registerHelper("showTimeAgoTimestamp", date => {
  return helpers.showTimeAgoTimestamp(date)
})

// Get profile image or placeholder image
Template.registerHelper("getProfileImage", image => {
  return helpers.getProfileImage(image)
})

// Get output of basic inline calculations
Template.registerHelper("math", () => {
  return helpers.math()
})

// Get the payment details 
Template.registerHelper("noPaymentDetail", user => {
  if (user) {
    return ((user.profile.paypalEmail === undefined || user.profile.paypalEmail === '') && 
            (user.profile.walletAddress === undefined || user.profile.walletAddress === ''))
  } 
})