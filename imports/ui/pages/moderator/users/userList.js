import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import './userList.html'

import { approveHourlyRate, hideConfirmationModal } from '/imports/api/users/methods'
import { notify } from '/imports/modules/notifier'

import { Timesheet } from '/imports/api/timesheet/timesheet'
import { Payments } from '/imports/api/payments/payments'

import moment from 'moment'

Template.userList.onCreated(function() {
    this.autorun(() => {
        this.subscribe('users')

        this.subscribe('timesheet.mod')
        this.subscribe('payments.mod')
    })
})

Template.userList.helpers({
    users: () => Meteor.users.find({}, {
        sort: {
            'profile.name': 1
        }
    }),
    approved: function() {
        return this.profile && this.profile.hourlyRateApproved
    },
    currentEarnings: function() {
        let ts = Timesheet.find({
            status: {
                $nin: ['payment-paid', 'payment-rejected', 'payment-inprogress']
            },
            owner: this._id
        }).fetch()

        return ts.map(v => v.totalEarnings ? v.totalEarnings : 0).reduce((acc, curr) => acc + curr, 0)
    },
    fixed: val => val ? val.toFixed(2) : '0.00',
    formatDate: (date) => {
        return moment(date).format('DD/MM/YY HH:mm:ss')
    },
    lastPayment: function() {
        return (Payments.findOne({
            owner: this._id
        }, {
            sort: {
                paidDate: -1
            }
        }) || {}).paidDate || ''
    }
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
