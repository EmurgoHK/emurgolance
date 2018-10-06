import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'

// Import needed templates
import '../../ui/layouts/body/body.js'
import '../../ui/pages/home/home.js'
import '../../ui/pages/landing/landing'
import '../../ui/pages/user/settings'
import '../../ui/pages/requestpayment/requestpayment'
import '../../ui/pages/moderator/users/userList'
import '../../ui/pages/moderator/users/userInfo'
import '../../ui/pages/moderator/payments/payments'
import '../../ui/pages/moderator/payments/paymentsview'
import '../../ui/pages/moderator/statistics/statistics'
import '../../ui/pages/timesheet/entry'
import '../../ui/pages/notifications/notifications'
import '../../ui/pages/repos/repos'
import '../../ui/pages/issues/issues'


const modRoutes = FlowRouter.group({
	prefix: '/moderator',
	name: 'moderator'  
})

// Set up all routes in the app
FlowRouter.route('/', {
	name: 'home',
  	action: () => {
      if (Meteor.userId() || (process.env && process.env.NODE_ENV === 'development')){
        BlazeLayout.render('mainLayout', {
          header: 'header',
          main: 'home',
          sidebar: 'sidebar',
        })
      } else {
        BlazeLayout.render('landingPage')
      }
  	},
});

FlowRouter.route('/issues', {
	name: 'issues',
  	action: () => {
    	BlazeLayout.render('mainLayout', {
			header: 'header',
			main: 'issues',
			sidebar: 'sidebar'
    	})
  	},
});

FlowRouter.route('/entry/:id', {
	name: 'entry',
  	action: () => {
    	BlazeLayout.render('mainLayout', {
			header: 'header',
			main: 'entry',
			sidebar: 'sidebar',
    	})
  	},
});

FlowRouter.route('/settings', {
	name: 'settings',
  	action: () => {
    	BlazeLayout.render('mainLayout', {
			header: 'header',
			main: 'settings',
			sidebar: 'sidebar',
    	})
  	},
});

FlowRouter.route('/notifications', {
  name: 'notifications',
    action: () => {
      BlazeLayout.render('mainLayout', {
      header: 'header',
      main: 'notifications',
      sidebar: 'sidebar',
      })
    },
});


FlowRouter.route('/requestpayment', {
  name: 'requestPayment',
    action: () => {
      BlazeLayout.render('mainLayout', {
      header: 'header',
      main: 'requestpayment',
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

modRoutes.route('/user/:id', {
    action: () => {
        BlazeLayout.render('mainLayout', {
			header: 'header',
			  main: 'userInfo',
			  sidebar: 'sidebar'
        })
    },
    name: 'userInfo'
})

modRoutes.route('/payments', {
    action: () => {
        BlazeLayout.render('mainLayout', {
      header: 'header',
        main: 'payments',
        sidebar: 'sidebar'
        })
    },
    name: 'payments'
})

modRoutes.route('/payments/:paymentId', {
    action: () => {
        BlazeLayout.render('mainLayout', {
          main: 'paymentsview',
          header: 'header',
          sidebar: 'sidebar'
        })
    },
    name: 'paymentsView'
})

modRoutes.route('/statistics', {
    action: () => {
        BlazeLayout.render('mainLayout', {
          main: 'statistics',
          header: 'header',
          sidebar: 'sidebar'
        })
    },
    name: 'statistics'
})

modRoutes.route('/repos', {
    action: () => {
        BlazeLayout.render('mainLayout', {
          main: 'repos',
          header: 'header',
          sidebar: 'sidebar'
        })
    },
    name: 'statistics'
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
