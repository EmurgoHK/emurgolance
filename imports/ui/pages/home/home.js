import './home.html'

import { startWork, pauseWork, continueWork, finishWork } from '/imports/api/timesheet/methods'
import { Timesheet } from '/imports/api/timesheet/timesheet'
import { notify } from '/imports/modules/notifier.js'

import moment from 'moment'

const formatDuration = (duration) => {
	const pad = val => ('00' + val).slice(-2)

	return `${pad(duration.hours())}:${pad(duration.minutes())}:${pad(duration.seconds())}`
}

Template.home.onCreated(function() {
	this.autorun(() => {
		this.subscribe('timesheet.all')
	})

	this.timer = new ReactiveVar(new Date().getTime())

	Meteor.setInterval(() => this.timer.set(new Date().getTime()), 1000)
})

Template.home.helpers({
	timesheets: () => Timesheet.find({
		owner: Meteor.userId()
	}, {
		sort: {
			start: -1
		}
	}),
	total: () => {
		let total = Timesheet.find({
			owner: Meteor.userId(),
			active: false
		}).fetch()

		let active = Timesheet.findOne({
			owner: Meteor.userId(),
			active: true
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
	fixed: val => val ? val.toFixed(2) : '0.00',

})

Template.home.events({
	'click #js-start': (event, templateInstance) => {
		event.preventDefault()

		startWork.call({
			issue: $('#js-issue').val()
		}, (err, data) => {
			if (err) {
				notify(err.reason || err.message, 'error')
			}
		})
	},
	'click #js-pause': function (event, templateInstance) {
		event.preventDefault()

		pauseWork.call({
			workId: this._id
		}, (err, data) => {
			if (err) {
				notify(err.reason || err.message, 'error')
			}
		})
	},
	'click #js-continue': function (event, templateInstance) {
		event.preventDefault()

		continueWork.call({
			workId: this._id
		}, (err, data) => {
			if (err) {
				notify(err.reason || err.message, 'error')
			}
		})
	},
	'click #js-finish': function (event, templateInstance) {
		event.preventDefault()

		finishWork.call({
			workId: this._id
		}, (err, data) => {
			if (err) {
				notify(err.reason || err.message, 'error')
			}
		})
	}
})
