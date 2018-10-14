import './manualpayments-list.html'

import { FlowRouter } from 'meteor/kadira:flow-router'

import { ManualPayments } from '/imports/api/manual-payments/manual-payments'
import { removeManualPayment } from '/imports/api/manual-payments/methods'
import { notify } from '/imports/modules/notifier'

Template.manualpaymentsList.onCreated(function () {
    this.paymentId = new ReactiveVar(undefined)

    this.autorun(() => {
        this.subscribe('manualPayments.all')
    })
})

Template.manualpaymentsList.helpers({
    manualPayments () {
        return ManualPayments.find({ 
            paymentId : Template.instance().paymentId.get()
        }).fetch()
    }
})

Template.manualpaymentsList.events({
    'click .js-remove-payment' (_event, _tpl) {
        removeManualPayment.call({ id : this._id }, (err, _data) => {
            if (err) {
                notify(err.reason || err.message, 'error')
                return true
            }

            notify('Manual request successfully deleted', 'success')
        })
    },
    'show.bs.modal #manualPaymentsListModal' (event, tpl) {
        const paymentId = event.relatedTarget.dataset.paymentId
        tpl.paymentId.set(paymentId)
    }
})