import { Meteor } from 'meteor/meteor'
import { ManualPayments } from '../manual-payments'

Meteor.publish('manualPayments.all', function () {
	return ManualPayments.find({ userId : Meteor.userId() })
})

Meteor.publish('manualPayments.mod', function () {
	return ManualPayments.find({ })
})