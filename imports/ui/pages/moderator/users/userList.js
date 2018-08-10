import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import './userList.html'

import { approveHourlyRate, hideConfirmationModal } from '/imports/api/users/methods'
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

        if (!~(Meteor.users.findOne({ _id: Meteor.userId() }).hidden || []).indexOf('approve')) {
            swal({
                text: `Are you sure that you want to approve the hourly rate?`,
                icon: 'warning',
                buttons: {
                    hide: {
                        text: 'Don\'t show again',
                        value: 'hide',
                        visible: true,
                        closeModal: true
                    },
                    cancel: {
                        text: 'No',
                        value: false,
                        visible: true,
                        closeModal: true
                    },
                    confirm: {
                        text: 'Yes',
                        value: true,
                        visible: true,
                        closeModal: true
                    }
                },
                dangerMode: true
            }).then(val => {
                if (val === 'hide') {
                    hideConfirmationModal.call({
                        modalId: 'approve'
                    }, (err, data) => {
                        if (err) {
                            notify(err.reason || err.message, 'error')
                        }
                    })
                }

                if (val) {
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
        } else {
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
    }
})
