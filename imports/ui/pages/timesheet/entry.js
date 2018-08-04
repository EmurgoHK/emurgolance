import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import './entry.html'

import { editWork } from '/imports/api/timesheet/methods'
import { Timesheet } from '/imports/api/timesheet/timesheet'
import { notify } from '/imports/modules/notifier.js'
import { isModerator } from '/imports/api/users/methods'

import moment from 'moment'

import { formatDuration } from '../home/home'

Template.entry.onCreated(function() {
	this.autorun(() => {
		this.subscribe('timesheet.id', FlowRouter.getParam('id'))
		this.subscribe('users')
	})
})

Template.entry.helpers({
	username: function() {
		return ((Meteor.users.findOne({
			_id: this.owner
		}) || {}).profile || {}).name
	},
	editedBy: function() {
		return ((Meteor.users.findOne({
			_id: this.editedBy
		}) || {}).profile || {}).name
	},
	canEdit: function() {
		return this.owner === Meteor.userId() || isModerator(Meteor.userId())
	},
	change: function() {
		let diff = this.newTime - this.oldTime

		if (diff > 0) {
			return `<span style="color: green">+${formatDuration(moment.duration(diff))}</span>`
		}

		return `<span style="color: red">-${formatDuration(moment.duration((diff * -1)))}</span>`
	},
	totalEarnings: () => {
		return (Timesheet.findOne({
			_id: FlowRouter.getParam('id')
		}) || {}).totalEarnings
	},
	entry: () => {
		return Timesheet.findOne({
			_id: FlowRouter.getParam('id')
		}) || {}
	},
	total: () => {
		let total = Timesheet.findOne({
			_id: FlowRouter.getParam('id')
		})

		let user = Meteor.users.findOne({
			_id: total.owner
		}) || {}

		let duration = total.totalTime

		let dec = duration / (1000 * 60 * 60)

		return {
			formattedTime: formatDuration(moment.duration(duration || 0)),
			decimalTime: dec,
			earnings: dec * ((user.profile) || {}).hourlyRate || 0
		}
	},
	formatDate: (date) => {
		return moment(date).format('DD/MM/YY HH:mm:ss')
	},
	formatDuration: val => formatDuration(moment.duration(val)),
	fixed: val => val ? val.toFixed(2) : '0.00'
})

Template.entry.events({
	'keyup #js-totalTime': (event, templateInstance) => {
		if (event.keyCode === 13) {
			$('#js-edit').click()
		}
	},
	'click #js-edit': (event, templateInstance) => {
		event.preventDefault()

		editWork.call({
			workId: FlowRouter.getParam('id'),
			newTotal: moment.duration($('#js-totalTime').val())._milliseconds
		}, (err, data) => {
			if (err) {
				notify(err.reason || err.message, 'error')
			}
		})
	}
})
