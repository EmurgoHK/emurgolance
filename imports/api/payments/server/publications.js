import { Meteor } from 'meteor/meteor'
import { Payments } from '../payments'

import { isModerator } from '/imports/api/users/methods'

Meteor.publish('payments', function () {
	return Payments.find({})
})

Meteor.publish('payments.mod', function () {
	if (Meteor.userId() && isModerator(Meteor.userId())) {
		return Payments.find({}, {
			sort: {
				createdAt: -1
			}
		})
	}
})