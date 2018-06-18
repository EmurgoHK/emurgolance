import './header.html'

Template.header.events({
    'click .sidebar-toggler': function() {
        $('body').toggleClass("sidebar-lg-show")
    },
    'click .sign-in': function(event) {
        event.preventDefault();
        console.log("called")

        Meteor.loginWithGithub({}, (err) => {
            if (err) {
                notify(err.message, "error")
            return
            }
            var redirectTo = window.last || '/'
            FlowRouter.go(redirectTo)
        })
    },
    'click .sign-out': (event) => {
        event.preventDefault()

        if (Meteor.userId()) {
            Meteor.logout()
        }
    }
})
