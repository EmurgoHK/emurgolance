import { Meteor } from 'meteor/meteor'

Meteor.publish(null, () => Meteor.users.find({
	_id: Meteor.userId()
}, {
	fields: {
		profile: 1,
		moderator: 1,
		_id: 1
	}
}))

Meteor.publish('users', () => Meteor.users.find({}, {
	fields: {
		profile: 1,
		moderator: 1,
		_id: 1
	}
}))