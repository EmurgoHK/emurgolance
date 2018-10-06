import { Accounts } from 'meteor/accounts-base'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { notify } from '/imports/modules/notifier.js'

Accounts.onLogout(() => {
	if (~['entry', 'settings', 'userList', 'payments', 'paymentsView', 'requestPayment'].indexOf(FlowRouter.current().route.name)) { // all protected pages are here
		FlowRouter.go('/')
		// $('#signInModal').modal('show') // show the login screen
	}

	notify('Successfully logged out!', 'success')
});

const mustBeLoggedIn = (context, redirect, stop) => {
  	if (!Meteor.userId()) {
   		FlowRouter.go('/')

   		notify('You have to be logged in to access the page.', 'error')
  	}
}

FlowRouter.triggers.enter([mustBeLoggedIn], {
	except: ['home']
})