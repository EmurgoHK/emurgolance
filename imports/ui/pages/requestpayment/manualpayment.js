import './manualpayment.html'

import { requestManualPayment } from '/imports/api/manual-payments/methods'
import { notify } from '/imports/modules/notifier'

Template.manualpayment.onCreated(function () {
    this.paymentId = new ReactiveVar(undefined)

    this.autorun(() => {
        this.subscribe('manualPayments.all')
    })
})

Template.manualpayment.events({
    'click .js-submit-request' (event, tpl) {
        event.preventDefault()

        const inputs = $('form#manualPaymentForm').serializeArray()
        const addMore = event.currentTarget.dataset.addMore
        const paymentId = tpl.paymentId.get()

        // create formData object and input values to object
        // with input names as properties
        let formData = new Object
        formData.paymentId = paymentId

        for (let i = 0; i < inputs.length; i++) {
            formData[inputs[i].name] = inputs[i].value
        }

        requestManualPayment.call(formData, (err, _data) => {
            const form = $('form#manualPaymentForm')
            form.addClass('was-validated')
            
            if (err && err.details) {
                for (let i = 0; i < err.details.length; i++) {
                    const errMsg = err.details[i]
                    $(`.${errMsg.name}-feedback`).text(errMsg.message)
                }

                return true
            }
            
            notify('Manual request successfully sent', 'success')
            form.removeClass('was-validated')
            form.trigger('reset')

            if (addMore) { return true } // do not close modal if user addMore is true
            $('#manualPaymentModal').modal('hide')
        })  
    },
    'show.bs.modal #manualPaymentModal' (event, tpl) {
        const paymentId = event.relatedTarget.dataset.requestId
        tpl.paymentId.set(paymentId)
    }
})