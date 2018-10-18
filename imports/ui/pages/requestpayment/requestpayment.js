import './requestpayment.html'

import { Payments } from '/imports/api/payments/payments'
import moment from 'moment'
import { requestPayment, cancelPayment } from '/imports/api/payments/methods'
import { notify } from '/imports/modules/notifier'
import { Timesheet } from '/imports/api/timesheet/timesheet'
import swal from 'sweetalert'

Template.requestpayment.onCreated(function() {

    this.autorun(() => {
        this.subscribe('timesheet.all')
        this.subscribe('payments')
    })

})

Template.requestpayment.onRendered(function() {


})

Template.requestpayment.helpers({
    outstandingEarnings: () => {
        let sum = Timesheet.find({ owner: Meteor.userId(), finished: true, status: { $exists: false } }).fetch()

        return sum.map(v => v.totalEarnings ? v.totalEarnings : 0).reduce(
            (acc, curr) => acc + curr, 0
        )
    },
    inprogressEarnings: () => {
        let outstandingPayment = Payments.findOne({ owner: Meteor.userId(), status: 'not-paid'});

        return outstandingPayment ? outstandingPayment.amount : 0;
    },
    paidEarnings: () => {
        let sum = Timesheet.find({ owner: Meteor.userId(), status: 'payment-paid', finished: true }).fetch()

        return sum.map(v => v.totalEarnings ? v.totalEarnings : 0).reduce(
            (acc, curr) => acc + curr, 0
        )
    },
    fixed: val => val ? val.toFixed(2) : '0.00',
    endOfWeek: () => {
        return moment(moment().endOf('week').toDate()).format("DD/MM/YYYY");
    },
    payments: () => {
        return Payments.find({ owner : Meteor.userId() }, {
            sort: {
                createAt: -1
            }
        })
    },
    statusName: (status) => {
        return status.replace(/-/gi, ' ')
    },
    formatDate: (timestamp) => {
        return moment(timestamp).format('dddd, MMMM Do YYYY, h:mm:ss a')
    },
    notPaid: (status) => {
        return status === 'not-paid'
    }
})

Template.requestpayment.events({
    'click #js-requestPayment': (event, templateInstance) => {
        event.preventDefault()

        let user = Meteor.users.findOne({
            _id: Meteor.userId()
        })

        let endOfWeek = moment(moment().endOf('week').toDate()).format("DD/MM/YYYY");

        let sum = Timesheet.find({ owner: Meteor.userId(), status: { $exists: false }, finished: true }).fetch()

        let totalEarnings = sum.map(v => v.totalEarnings ? v.totalEarnings : 0).reduce(
            (acc, curr) => acc + curr, 0
        )

        //return an error if the user tries to request a payment under the min payout
        if (totalEarnings < user.profile.minpayout) {
            notify('You have not earned enough to request a manual payout', 'error')
        }

        //return success if the user tries to request a payment and is over the max threashold
        if (totalEarnings > user.profile.maxpayout) {

            requestPayment.call({}, (err, data) => {
                if (err) {
                    notify(err.reason || err.message, 'error')
                }
            })
            notify('Great news, payments will be sent out on ' + endOfWeek, 'success');

        } else if (totalEarnings > user.profile.minpayout) {

            requestPayment.call({}, (err, data) => {
                if (err) {
                    notify(err.reason || err.message, 'error')
                }
            })

            notify('Great news, payments will be sent out on ' + endOfWeek, 'success');

        }


    },
    'click .cancelPayment': (event, _templateInstance) => {
        swal({
            text: 'Arr you sure you want to cancel this payment?',
            icon: 'warning',
            buttons: true,
            dangerMode: true
        }).then((cancel) => {
            if (cancel) {
                let paymentId = event.currentTarget.id
                
                cancelPayment.call({ paymentId : paymentId }, (err, _data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                        return
                    }
                    
                    notify('You have successfully cancelled payment', 'success');
                })      
            }
        })
    },
    'click .js-manual-payment' (event, _tpl) {
        event.preventDefault()
        $('#manualPaymentModal').modal('show')
    }
})