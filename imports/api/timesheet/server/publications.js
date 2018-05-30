import { Meteor } from 'meteor/meteor'
import { Timesheet } from '../timesheet'

Meteor.publish('timesheet.all', function () {
	return Timesheet.find({
		owner: Meteor.userId()
	}, {
		sort: {
			start: -1
		}
	})
})

Meteor.publish('timesheet.active', function () {
	return Timesheet.find({
		owner: Meteor.userId(),
		active: true
	})
})

Meteor.publish('timesheet.completed', function () {
	return Timesheet.find({
		owner: Meteor.userId(),
		completed: true
	})
})