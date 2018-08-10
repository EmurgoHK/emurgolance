import './settings.html'

import { FlowRouter } from 'meteor/kadira:flow-router'
import { saveSettings } from '/imports/api/users/methods'
import { notify } from '/imports/modules/notifier'
import { resetHiddenModals } from '/imports/api/users/methods'


Template.settings.onCreated(function() {
	this.selectedPaymentMethod = new ReactiveVar('')
})

Template.settings.onRendered(function() {
	Tracker.autorun(() => {
		let user = Meteor.users.findOne({
			_id: Meteor.userId()
		})

		if (user && user.profile && user.profile.paymentMethod) {
			this.selectedPaymentMethod.set(user.profile.paymentMethod)
		}
	})
})


Template.settings.helpers({
	selectedPaymentMethod: (paymentMethod) => {
		let selected = Template.instance().selectedPaymentMethod.get()
		$('#' + selected + '-payment').prop('checked', true)
		return (selected === paymentMethod)
	},
	or: (a, b) => {
		return a || b
	}
})

Template.settings.events({
	'submit #signup': (event, templateInstance) => {
		event.preventDefault()

		saveSettings.call({
			name: $('#js-name').val(),
			paymentMethod: $('input[name="js-payment"]:checked').val(),
			hourlyRate: $('#js-hr').val(),
			paypalEmail: $('#js-paypal-email').val(),
			walletAddress: $('#js-wallet-address').val(),
			bankDetails: $('#js-bank-details').val(),
			minpayout: $('#js-minpayout').val(),
			maxpayout: $('#js-maxpayout').val(),

		}, (err, data) => {
			if (!err) {
				FlowRouter.go('/')
			} else {
				notify(err.reason || err.message, 'error')
			}
		})
	},
	'click .form-check-input': (event, templateInstance) => {
		event.preventDefault()
		templateInstance.selectedPaymentMethod.set(event.target.value)
	},
	'click #js-reset-hidden': (event, templateInstance) => {
		event.preventDefault()

		resetHiddenModals.call({}, (err, data) => {
			if (!err) {
				notify('Successfully reseted.', 'success')
			} else {
				notify(err.reason || err.message, 'error')
			}
		})
	}
})