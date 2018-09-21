import './header.html'
import { notify } from "/imports/modules/notifier"
import { Notifications } from '/imports/api/notifications/both/notificationsCollection'

Template.header.onCreated(function() {

    this.autorun(() => {

        if (Meteor.userId()) {
            this.subscribe('notifications')
        }
    })
})

Template.header.helpers({
    notificationsCount: () => Notifications.find({
        userId: Meteor.userId(),
        read: false,
        $or: [{
            type: 'notification'
        }, {
            type: {
                $exists: false
            }
        }]
    }).count()
})


Template.header.events({
    'click .sidebar-toggler': function() {
        $('body').toggleClass("sidebar-show")
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