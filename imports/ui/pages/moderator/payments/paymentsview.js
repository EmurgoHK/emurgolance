import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import moment from 'moment';

import './paymentsview.html'

import { markAsPaid } from '/imports/api/payments/methods'
import { notify } from '/imports/modules/notifier'
import { Payments } from '/imports/api/payments/payments'
import { Timesheet } from '/imports/api/timesheet/timesheet'

const formatDuration = (duration) => {
    const pad = val => ('00' + val).slice(-2)

    return `${pad((duration.days() * 24) + duration.hours())}:${pad(duration.minutes())}:${pad(duration.seconds())}`
}

const calculateEarnings = () => {
    var sum = 0;

    $("input[type=checkbox]:checked").each(function() {
        sum += parseInt($(this).attr("rel"));
    });

    return sum ? sum : 0.00;
}

Template.paymentsview.onCreated(function() {
    this.approvedEarnings = new ReactiveVar()
    this.autorun(() => {
        this.subscribe('timesheet.paymentId', FlowRouter.getParam("paymentId"))
        this.subscribe('payments')
        this.subscribe('users')
    })
})

Template.paymentsview.helpers({
    removeHostname: (url) => {
       return url.replace(/http(s|):\/\/github.com\/(blockrazor|emurgohk)\//i, '')
    },
    markedForApproval: (id) => {
        //check to see if the payment has been made.
        if($('#' + id).is(":checked")){
            console.log(true)
            return true
        }else{
            console.log(false)
        }
    },
    paid: () => {
        //check to see if the payment has been made.
        let paid = Payments.findOne({ _id: FlowRouter.getParam("paymentId"), status: 'payment-paid' });

        return paid ? paid.status : null
    },
    totalApprovedEarnings: () => {
        return Template.instance().approvedEarnings.get()
    },
    totalPaidEarnings:  () => {
        let sum = Timesheet.find({
            paymentId: FlowRouter.getParam('paymentId'),
            status:'payment-paid'
        }).fetch()

        return sum.map(v => v.totalEarnings ? v.totalEarnings : 0).reduce(
            (acc, curr) => acc + curr, 0
        )
    },
    totalTimeSheetEarnings: () => {
        let sum = Timesheet.find({
            paymentId: FlowRouter.getParam('paymentId')
        }).fetch()

        return sum.map(v => v.totalEarnings ? v.totalEarnings : 0).reduce(
            (acc, curr) => acc + curr, 0
        )
    },
    totalTime: (id) => {
        let total = Timesheet.find({
            owner: Meteor.userId(),
            active: false,
            paymentId: FlowRouter.getParam('paymentId')
        }).fetch()

        let active = Timesheet.findOne({
            owner: Meteor.userId(),
            active: true,
            paymentId: FlowRouter.getParam('paymentId')
        })

        let user = Meteor.users.findOne({
            _id: Meteor.userId()
        }) || {}

        let duration = total.reduce((i1, i2) => i1 + i2.totalTime, 0)

        if (active) {
            duration += (Template.instance().timer.get() - active.startTime) + (active.totalTime || 0)
        }

        let dec = duration / (1000 * 60 * 60)

        return {
            formattedTime: formatDuration(moment.duration(duration)),
            decimalTime: dec,
            earnings: dec * ((user.profile) || {}).hourlyRate || 0
        }
    },
    total: () => {
        let total = Timesheet.find({
            owner: Meteor.userId(),
            active: false,
            paymentId: FlowRouter.getParam('paymentId')
        }).fetch()

        let active = Timesheet.findOne({
            owner: Meteor.userId(),
            active: true,
            paymentId: FlowRouter.getParam('paymentId')
        })

        let user = Meteor.users.findOne({
            _id: Meteor.userId()
        }) || {}

        let duration = total.reduce((acc, curr) => acc + curr.totalTime, 0)

        if (active) {
            duration += (Template.instance().timer.get() - active.startTime) + (active.totalTime || 0)
        }

        let dec = duration / (1000 * 60 * 60)

        return {
            formattedTime: formatDuration(moment.duration(duration)),
            decimalTime: dec,
            earnings: dec * ((user.profile) || {}).hourlyRate || 0
        }
    },
    totalTime: function() {
        let duration

        if (this.active) {
            duration = moment.duration((Template.instance().timer.get() - this.startTime) + (this.totalTime || 0))
        } else {
            duration = moment.duration(this.totalTime)
        }

        return formatDuration(duration)
    },
    timesheets: () => Timesheet.find({
        paymentId: FlowRouter.getParam('paymentId')
    }),
    fixed: val => val ? val.toFixed(2) : '0.00',
    formatDate: (date) => {
        return moment(date).format('DD/MM/YY HH:mm:ss')
    },
    costBreakdown: () => {
        let projects = {}
        let total = 0

        Timesheet.find({
            paymentId: FlowRouter.getParam('paymentId')
        }).fetch().forEach(i => {
            projects[i.project] = (projects[i.project] || 0) + i.totalEarnings

            total += i.totalEarnings
        })

        return Object.keys(projects).sort((i1, i2) => projects[i2] - projects[i1]).map(i => ({
            project: `${i[0].toUpperCase()}${i.slice(1)}`,
            earnings: `$${projects[i].toFixed(2)}`,
            percentage: `${((projects[i] / total) * 100).toFixed(2)}%`
        }))
    }
})

Template.paymentsview.events({
    'change .earningsCheckbox': function(event, templateInstance) {

        let updateEarnings = calculateEarnings();
        templateInstance.approvedEarnings.set(updateEarnings);
        $('#reject_'+event.target.id).toggle();

    },
    'click .paid': function(event, templateInstance) {
        event.preventDefault();
        let approvedTimesheets = [];
        let notApprovedTimesheets = [];
        let approvedEarnings = Template.instance().approvedEarnings.get();

        $("input[type=checkbox]:checked").each(function() {
            approvedTimesheets.push(this.id)
        });

        $("input:checkbox:not(:checked)").each(function() {
           notApprovedTimesheets.push({_id: this.id, rejectReason: $('#reject_'+this.id).val()})

        });


            markAsPaid.call({
                paymentId : FlowRouter.getParam("paymentId"),
                approvedTimesheets: approvedTimesheets,
                notApprovedTimesheets: notApprovedTimesheets,
            }, (err, data) => {
                if (err) {
                    notify(err.reason || err.message, 'error')
                } else {
                    FlowRouter.go('/')
                    notify('Marked as Paid', 'success')
                }
            })



    }
})