import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'

// Import needed templates
import '../../ui/layouts/body/body.js'
import '../../ui/pages/home/home.js'
import '../../ui/pages/user/signupDetails'

// Set up all routes in the app
FlowRouter.route('/', {
	name: 'home',
  	action: () => {
    	BlazeLayout.render('mainLayout', {
    		main: 'home'
    	})
  	}
})

FlowRouter.route('/details', {
	name: 'details',
  	action: () => {
    	BlazeLayout.render('mainLayout', {
    		main: 'signupDetails'
    	})
  	}
})

FlowRouter.notFound = {
  	action: () => {
    	BlazeLayout.render('mainLayout', {
    		main: 'error404'
    	})
  	}
}

FlowRouter.triggers.enter([() => {
  	Tracker.autorun(() => { // redirection should be reactive, hence the Tracker is used
    	let user = Meteor.userId() && Meteor.users.findOne({
      		_id: Meteor.userId()
    	})

    	if (user && user.profile && !user.profile.paymentMethod) {
      		FlowRouter.go('/details') // redirect to the additional details page only once
    	}
  	})
}])
