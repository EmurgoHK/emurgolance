import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'

import { Payments } from './payments'
import { Timesheet } from '/imports/api/timesheet/timesheet'
import { sendNotification } from '/imports/api/notifications/both/notificationsMethods'

export const requestPayment = new ValidatedMethod({
    name: 'requestPayment',
    validate: null,
    run({}) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        //return all timesheets which have not had payments requested
        let notPaidTimesheets = Timesheet.find({ owner: Meteor.userId(), status: { $exists: false } }).fetch()

        //what is the grand total owed to the user
        let totalEarnings = notPaidTimesheets.map(v => v.totalEarnings ? v.totalEarnings : 0).reduce(
            (acc, curr) => acc + curr, 0
        )

        //create a primary payment record assosciated to the user
        let paymentId = Payments.insert({
            amount: totalEarnings,
            status: 'not-paid',
            owner: Meteor.userId(),
            createAt: new Date().getTime()

        })

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
            //
            getAllModerators.forEach(i => {
                sendNotification(i._id, 'Payment Request', Meteor.user().profile.name, '/moderator/payments','notification') //userId, message, from, href, type
            })


            return true;
        } else {
            throw new Meteor.Error('Error.', 'Unable to process payments')

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
        }
    }).validator({
        clean: true
    }),
    run({ paymentId, approvedTimesheets, notApprovedTimesheets }) {
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