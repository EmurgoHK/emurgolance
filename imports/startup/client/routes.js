import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'

// Import needed templates
import '../../ui/layouts/body/body.js'
import '../../ui/pages/home/home.js'
import '../../ui/pages/user/settings'
import '../../ui/pages/moderator/users/userList'

const modRoutes = FlowRouter.group({
	prefix: '/moderator',
	name: 'moderator'  
})

// Set up all routes in the app
FlowRouter.route('/', {
	name: 'home',
  	action: () => {
    	BlazeLayout.render('mainLayout', {
			header: 'header',
			main: 'home',
			sidebar: 'sidebar'
    	})
  	}
})

FlowRouter.route('/settings', {
	name: 'settings',
  	action: () => {
    	BlazeLayout.render('mainLayout', {
			header: 'header',
			main: 'settings',
			sidebar: 'sidebar'
    	})
  	}
})

modRoutes.route('/users', {
    action: () => {
        BlazeLayout.render('mainLayout', {
			header: 'header',
			  main: 'userList',
			  sidebar: 'sidebar'
        })
    },
    name: 'userList'
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
      		FlowRouter.go('/settings') // redirect to the additional details page only once
    	}
  	})
}])
