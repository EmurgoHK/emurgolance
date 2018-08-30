import { Meteor } from 'meteor/meteor'
import { Payments } from '../payments'

Meteor.publish('payments', function (userId) {
	return Payments.find({
		owner: userId
	})
})