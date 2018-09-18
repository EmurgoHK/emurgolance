import './userInfo.html'

import { FlowRouter } from 'meteor/kadira:flow-router'

import { Timesheet } from '/imports/api/timesheet/timesheet'
import { notify } from '/imports/modules/notifier.js'

import moment from 'moment'

import { formatDuration } from '/imports/ui/pages/home/home'

Template.userInfo.onCreated(function() {
	this.autorun(() => {
		this.subscribe('timesheet.mod')
		this.subscribe('users.mod')
	})

	this.timer = new ReactiveVar(new Date().getTime())

	Meteor.setInterval(() => this.timer.set(new Date().getTime()), 1000)
})

Template.userInfo.helpers({
	removeHostname: (url) => {
       return url.replace(/http(s|):\/\/github.com\/(blockrazor|emurgohk)\//i, '')
    },
	user: () => Meteor.users.findOne({ _id: FlowRouter.getParam('id') }),
	totalEarnings: () => {
		let sum = Timesheet.find({ owner: FlowRouter.getParam('id') }).fetch()
		
		return sum.map(v => v.totalEarnings ? v.totalEarnings : 0).reduce((acc, curr) => acc + curr, 0)
	},
	notPaidEarnings: () => {
		let sum = Timesheet.find({
			owner: FlowRouter.getParam('id'),
			status: {
                $nin: ['payment-paid', 'payment-rejected', 'payment-inprogress']
            }
        }).fetch()
		
		return sum.map(v => v.totalEarnings ? v.totalEarnings : 0).reduce((acc, curr) => acc + curr, 0)
	},
	timesheets: () => Timesheet.find({
		owner: FlowRouter.getParam('id')
	}, {
		sort: {
			start: -1
		}
	}),
	total: () => {
		let total = Timesheet.find({
			owner: FlowRouter.getParam('id'),
			active: false
		}).fetch()

		let active = Timesheet.findOne({
			owner: FlowRouter.getParam('id'),
			active: true
		})

		let user = Meteor.users.findOne({
			_id: FlowRouter.getParam('id')
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
	totalTime: function () {
		let duration

		if (this.active) {
			duration = moment.duration((Template.instance().timer.get() - this.startTime) + (this.totalTime || 0))
		} else {
			duration = moment.duration(this.totalTime)
		}

		return formatDuration(duration)
	},
	formatDate: (date) => {
		return moment(date).format('DD/MM/YY HH:mm:ss')
	},
	fixed: val => val ? Number(val).toFixed(2) : '0.00',
	paid: function() {
		return this.status === 'payment-paid'
	},
	pending: function() {
		return this.status === 'payment-inprogress'
	},
	rejected: function() {
		return this.status === 'payment-rejected'
	}
})

