import './header.html'
import { notify } from "/imports/modules/notifier"

Template.header.events({
    'click .sidebar-toggler': function() {
        $('body').toggleClass("sidebar-lg-show")
    },
    'click .sign-in': function(event) {
        event.preventDefault();

        if (process.env && process.env.NODE_ENV == 'development') {
            $('#signInModal').modal('show')
        } else {
            Meteor.loginWithGithub({}, (err) => {
                if (err) {
                    notify(err.message, "error")
                return
                }
                var redirectTo = window.last || '/'
                FlowRouter.go(redirectTo)
            })
        }
    },
    'click .sign-out': (event) => {
        event.preventDefault()

        if (Meteor.userId()) {
            Meteor.logout()
        }
    }
})
