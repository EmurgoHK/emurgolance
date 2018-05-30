import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'

// Import needed templates
import '../../ui/layouts/body/body.js'
import '../../ui/pages/home/home.js'

// Set up all routes in the app
FlowRouter.route('/', {
	name: 'home',
  	action: () => {
    	BlazeLayout.render('mainLayout', {
    		main: 'home'
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
