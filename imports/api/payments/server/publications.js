import { Meteor } from 'meteor/meteor'
import { Payments } from '../payments'

Meteor.publish('payments', function (_userId) {
	return Payments.find({ })
})