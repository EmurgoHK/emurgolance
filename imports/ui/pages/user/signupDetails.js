import './signupDetails.html'

import { FlowRouter } from 'meteor/kadira:flow-router'
import { saveDetails } from '/imports/api/users/methods'
import { notify } from '/imports/modules/notifier'

Template.signupDetails.events({
	'submit #signup': (event, templateInstance) => {
		event.preventDefault()

		saveDetails.call({
			name: $('#js-name').val(),
			paymentMethod: $('input[name="js-payment"]:checked').val()
		}, (err, data) => {
			if (!err) {
				FlowRouter.go('/')
			} else {
				notify(err.reason || err.message, 'error')
			}
		})
	}
})