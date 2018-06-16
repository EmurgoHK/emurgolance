import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import './userList.html'

import { approveHourlyRate } from '/imports/api/users/methods'
import { notify } from '/imports/modules/notifier'

Template.userList.onCreated(function() {
    this.autorun(() => {
        this.subscribe('users')
    })
})

Template.userList.helpers({
    users: () => Meteor.users.find({
        'profile.hourlyRateApproved': false
    }, {
        sort: {
            'profile.name': 1
        }
    })
})

Template.userList.events({
    'click .approve': function(event, templateInstance) {
        event.preventDefault()

        approveHourlyRate.call({
            userId: this._id
        }, (err, data) => {
            if (err) {
                notify(err.reason || err.message, 'error')
            } else {
                notify('Approved.', 'success')
            }
        })
    }
})
