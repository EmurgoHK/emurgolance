import '/imports/ui/pages/requestpayment/manualpayments'

import { FlowRouter } from 'meteor/kadira:flow-router'

import { ManualPayments } from '/imports/api/manual-payments/manual-payments'
import { notify } from '/imports/modules/notifier'

Template.manualpayments.onCreated(function () {
    this.paymentId = new ReactiveVar(undefined)

    this.autorun(() => {
        this.subscribe('manualPayments.mod')
    })
})

Template.manualpayments.helpers({
    manualPayments () {
        return ManualPayments.find({ 
            paymentId : FlowRouter.getParam("paymentId") 
        }).fetch()
    }
})

Template.manualpayments.events({
    'show.bs.modal #manualPaymentModal' (event, tpl) {
        const paymentId = event.relatedTarget.dataset.requestId
        tpl.paymentId.set(paymentId)
    }
})