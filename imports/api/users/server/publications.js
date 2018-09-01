import { Meteor } from 'meteor/meteor'

import { isModerator } from '/imports/api/users/methods'

Meteor.publish(null, () => Meteor.users.find({
	_id: Meteor.userId()
}, {
	fields: {
		profile: 1,
		moderator: 1,
		_id: 1,
		hidden: 1
	}
}))

Meteor.publish('users', () => Meteor.users.find({}, {
	fields: {
		profile: 1,
		moderator: 1,
		_id: 1,
		hidden: 1
	}
}))

Meteor.publish('users.mod', () => {
	if (Meteor.userId() && isModerator(Meteor.userId())) {
		return Meteor.users.find({}, {
			fields: {
				profile: 1,
				moderator: 1,
				_id: 1,
				hidden: 1
			}
		})
	}
})