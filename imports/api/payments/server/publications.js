import { Meteor } from 'meteor/meteor'
import { Payments } from '../payments'

Meteor.publish('payments', function () {
	return Payments.find({
		owner: Meteor.userId()
	})
})