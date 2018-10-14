import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'

import { Payments } from '/imports/api/payments/payments'
import { ManualPayments } from './manual-payments'

export const requestManualPayment = new ValidatedMethod({
    name: 'requestManualPayment',
    validate: new SimpleSchema({
        paymentId: {
            type: String,
            optional: false
        },
        summary: {
            type: String,
            optional: false,
            min: 1
        },
        amount: {
            type: Number,
            optional: false
        },
        details: {
            type: String,
            optional: true
        },
        pr_link: {
            type: SimpleSchema.RegEx.Url,
            optional: true
        }
    }).validator({
        clean: true
    }),
    run(data) {
        if (Meteor.isServer) { 
            if (!Meteor.userId()) {
                throw new Meteor.Error('Error.', 'You have to be logged in.')
            }

            // add userId and createdAt to manual payment data
            data.userId =  Meteor.userId()
            data.createdAt = new Date().getTime()
            
            // insert manual payment
            ManualPayments.insert(data)

            // update payment with manual payment amount
            const paymentId = data.paymentId
            Payments.update({ _id : paymentId }, {
                $inc : { amount : data.amount }
            })

            return paymentId
        }
    }
})