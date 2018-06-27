import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import './payments.html'

import { markAsPaid } from '/imports/api/payments/methods'
import { notify } from '/imports/modules/notifier'
import { Payments } from '/imports/api/payments/payments'


Template.payments.onCreated(function() {
    this.autorun(() => {
        this.subscribe('payments')
        this.subscribe('users')
    })
})

Template.payments.helpers({
    statusName: (status) => {

        switch (status) {
            case 'not-paid':
                return 'Not Paid'
                break;
            case 'payment-paid':
                return 'Paid'
                break;
        }

    },
    notPaid: (paymentId) => {

        //check to see if the payment has been made.
        let notPaid = Payments.findOne({ _id: paymentId, status: 'payment-paid' });

        return notPaid ? notPaid.status : null;

    },
    fixed: val => val ? val.toFixed(2) : '0.00',
    getName: (owner) => {

        //return the users name from the userId
        let getName = Meteor.users.findOne({ _id: owner }).profile.name;
        return getName ? getName : null
    },
    payments: () => Payments.find({
        owner: Meteor.userId()
    }, {
        sort: {
            createAt: -1
        }
    }),
})

Template.payments.events({
    'click .paid': function(event, templateInstance) {
        event.preventDefault()

        markAsPaid.call({
            paymentId: this._id
        }, (err, data) => {
            if (err) {
                notify(err.reason || err.message, 'error')
            } else {
                notify('Marked as Paid', 'success')
            }
        })
    }
})