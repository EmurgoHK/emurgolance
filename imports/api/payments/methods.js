import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'

import { Payments } from './payments'
import { Timesheet } from '/imports/api/timesheet/timesheet'
import { sendNotification } from '/imports/api/notifications/both/notificationsMethods'
import { ManualPayments } from '../manual-payments/manual-payments';

export const requestPayment = new ValidatedMethod({
    name: 'requestPayment',
    validate: null,
    run({}) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        // get current user and assign it to the user variable
        let user = Meteor.user()

        // get user's payment Details
        let paymentDetails = (paymentMethod) => {
            if (paymentMethod === 'swift')
                return user.profile.bankDetails

            if (paymentMethod === 'paypal')
                return user.profile.paypalEmail

            if (paymentMethod === 'bitcoin' || paymentMethod === 'cardano')
                return user.profile.walletAddress
        }

        //return all timesheets which have not had payments requested
        let notPaidTimesheets = Timesheet.find({ owner: Meteor.userId(), status: { $exists: false }, finished: true }).fetch()

        //what is the grand total owed to the user
        let totalEarnings = notPaidTimesheets.map(v => v.totalEarnings ? v.totalEarnings : 0).reduce(
            (acc, curr) => acc + curr, 0
        )

        let prevPayment = Payments.findOne({
            status: 'not-paid',
            owner: Meteor.userId()
        })

        let paymentId

        // if there are previous unpaid requests, append them 
        if (prevPayment) {
            paymentId = prevPayment._id

            Payments.update({
                _id: prevPayment._id
            }, {
                $set: {
                    amount: prevPayment.amount + totalEarnings,
                    paymentMethod: user.profile.paymentMethod || '',
                    paymentDetails: paymentDetails(user.profile.paymentMethod),
                    status: 'not-paid'
                },
                $push: {
                    history: {
                        editedAt: new Date().getTime(),
                        added: totalEarnings
                    }
                }
            })
        } else {
            //create a primary payment record assosciated to the user
            paymentId = Payments.insert({
                amount: totalEarnings,
                status: 'not-paid',
                owner: Meteor.userId(),
                paymentMethod: user.profile.paymentMethod || '',
                paymentDetails: paymentDetails(user.profile.paymentMethod),
                createAt: new Date().getTime()
            })
        }

        //update all timesheets to payment-inprogress
        notPaidTimesheets.forEach(i => {
            Timesheet.update({
                _id: i._id
            }, {
                $set: {
                    paymentId: paymentId,
                    status: 'payment-inprogress'
                }
            })
        })

        //if we have a paymentId return true, otherwise return an error to the client
        if (paymentId) {
            //return all users that are moderators
            let getAllModerators = Meteor.users.find({ moderator: true }).fetch()

            //send a notification to all moderators
            getAllModerators.forEach(i => {
                sendNotification(i._id, 'Payment Request', Meteor.user().profile.name, '/moderator/payments','notification') //userId, message, from, href, type
            })

            return true
        } else {
            throw new Meteor.Error('Error.', 'Unable to process payments')
        }
    }
})

export const cancelPayment = new ValidatedMethod({
    name: 'cancelPayment',
    validate: new SimpleSchema({
        paymentId: {
            type: String,
            optional: false
        },
    }).validator({
        clean: true
    }),
    run({ paymentId }) {
        if (Meteor.isServer) { 
            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You have to be logged in.')
            }

            let payment = Payments.findOne({ _id : paymentId })

            if (payment && payment.status === 'not-paid') {
                Payments.update({ _id : paymentId }, {
                    $set: { status: 'cancelled' }
                })

                Timesheet.update({ paymentId: paymentId, status: 'payment-inprogress' }, { 
                    $unset : {  status: 1, paymentId: 1 }
                }, { multi : true })

                //return all users that are moderators
                let getAllModerators = Meteor.users.find({ moderator: true }).fetch()
                let message = 'Cancelled payment request by ' + Meteor.user().profile.name 

                //send a notification to all moderators
                getAllModerators.forEach(i => {
                    sendNotification(i._id, message, Meteor.user().profile.name, '/moderator/payments', 'notification') //userId, message, from, href, type
                })

                return true
            } else {
                throw new Meteor.Error('Error.', 'Unable to cancel payment')
            }
        }
    }
})

export const markAsPaid = new ValidatedMethod({
    name: 'markAsPaid',
    validate: new SimpleSchema({
        paymentId: {
            type: String,
            optional: false
        },
        approvedTimesheets: [String],
        'notApprovedTimesheets': {
            type: Array
        },
        'notApprovedTimesheets.$': {
            type: Object
        },
        'notApprovedTimesheets.$._id': {
            type: String
        },
       'notApprovedTimesheets.$.rejectReason': {
            type: String
        },
        approvedManualPayments: [String],
        'notApprovedManualPayments': {
            type: Array
        },
        'notApprovedManualPayments.$': {
            type: Object
        },
        'notApprovedManualPayments.$._id': {
            type: String
        },
       'notApprovedManualPayments.$.rejectReason': {
            type: String
        },
    }).validator({
        clean: true
    }),
    run({ paymentId, approvedTimesheets, notApprovedTimesheets, approvedManualPayments, notApprovedManualPayments }) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        approvedTimesheets.forEach(function(doc) {
            Timesheet.update({
                _id: doc
            }, {
                $set: {
                    status: 'payment-paid',
                }
            })
        })

        notApprovedTimesheets.forEach(function(doc) {
            Timesheet.update({
                _id: doc._id
            }, {
                $set: {
                    status: 'payment-rejected',
                    rejectReason: doc.rejectReason,
                }
            })
        })

        approvedManualPayments.forEach(function(doc) {
            ManualPayments.update({
                _id: doc
            }, {
                $set: {
                    status: 'payment-paid'
                }
            })
        })

        notApprovedManualPayments.forEach(function(doc) {
            ManualPayments.update({
                _id: doc._id
            }, {
                $set: {
                    status: 'payment-rejected',
                    rejectReason: doc.rejectReason,
                }
            })
        })

        Payments.update({
            _id: paymentId
        }, {
            $set: {
                status: 'payment-paid',
                paidDate: new Date().getTime()
            }
        })

        let payment = Payments.findOne({ _id : paymentId });
        
        // send a notification to the user
        sendNotification(payment.owner, 'Payment completed', 'System' ,'/requestpayment', 'notification')
        
    }
})

if (Meteor.isDevelopment) {
    Meteor.methods({
        removePayments: () => {
            Payments.remove({})
        }
    })
}