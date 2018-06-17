import './settings.html'

import { FlowRouter } from 'meteor/kadira:flow-router'
import { saveSettings } from '/imports/api/users/methods'
import { notify } from '/imports/modules/notifier'

Template.settings.onRendered(function() {
	Tracker.autorun(() => {
		let user = Meteor.users.findOne({
			_id: Meteor.userId()
		})

		if (user && user.profile && user.profile.paymentMethod) {
			$(`input[name="js-payment"][value="${user.profile.paymentMethod}"]`).prop('checked', true)
		}
	})
})

Template.settings.events({
	'submit #signup': (event, templateInstance) => {
		event.preventDefault()

		saveSettings.call({
			name: $('#js-name').val(),
			paymentMethod: $('input[name="js-payment"]:checked').val(),
			hourlyRate: $('#js-hr').val()
		}, (err, data) => {
			if (!err) {
				FlowRouter.go('/')
			} else {
				notify(err.reason || err.message, 'error')
			}
		})
	}
})