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

Meteor.publish('timesheet.id', (id) => {
	return Timesheet.find({
		_id: id
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

Meteor.publish('timesheet.paymentId', function (paymentId) {
	return Timesheet.find({
		paymentId:paymentId
	})
})