import './home.html'

import { startWork, pauseWork, continueWork, finishWork, deleteWork } from '/imports/api/timesheet/methods'
import { Timesheet } from '/imports/api/timesheet/timesheet'
import { notify } from '/imports/modules/notifier.js'
import { hideConfirmationModal } from '/imports/api/users/methods'

import moment from 'moment'
import swal from 'sweetalert'

const formatDuration = (duration) => {
	const pad = val => val < 100 ? ('00' + val).slice(-2) : val

	return `${pad((duration.days() * 24) + duration.hours())}:${pad(duration.minutes())}:${pad(duration.seconds())}`
}

export { formatDuration }

Template.home.onCreated(function() {
	this.autorun(() => {
		this.subscribe('timesheet.all')
	})

	this.timer = new ReactiveVar(new Date().getTime())

	Meteor.setInterval(() => this.timer.set(new Date().getTime()), 1000)
})

Template.home.helpers({
	totalEarnings: () => {
		let sum = Timesheet.find({ owner: Meteor.userId(), paymentId: {$exists: false} }).fetch()
		
		return sum.map(v => v.totalEarnings ? v.totalEarnings : 0 ).reduce(
			(acc, curr) => acc + curr, 0
		)
	},
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
			active: false,
			paymentId: {$exists: false}
		}).fetch()

		let active = Timesheet.findOne({
			owner: Meteor.userId(),
			active: true,
			paymentId: {$exists: false}
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
	paid: function() {
		return this.status === 'payment-paid'
	},
	pending: function() {
		return this.status === 'payment-inprogress'
	},
	rejected: function() {
		return this.status === 'payment-rejected'
	},
	canEdit: function() {
		return ~['payment-paid', 'payment-rejected', 'payment-inprogress'].indexOf(this.status)
	}
})

Template.home.events({
	'click #js-start': (event, templateInstance) => {
		event.preventDefault()

		startWork.call({
			issue: $('#js-issue').val()
		}, (err, data) => {
			if (err) {
				notify(err.reason || err.message, 'error')
				$('#js-issue').val(''); //clear the issue input as the supplied data is invalid
			}else{
				$('#js-issue').val(''); //clear the input if succesfull
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

		if (!~(Meteor.users.findOne({ _id: Meteor.userId() }).hidden || []).indexOf('finish')) {
			swal({
	            text: `Are you sure that this issue is finished?`,
	            icon: 'warning',
	            buttons: {
	            	hide: {
	            		text: 'Don\'t show again',
	            		value: 'hide',
	            		visible: true,
	            		closeModal: true
	            	},
				  	cancel: {
				    	text: 'No',
				    	value: false,
				    	visible: true,
				    	closeModal: true
				  	},
				  	confirm: {
				    	text: 'Yes',
				    	value: true,
				    	visible: true,
				    	closeModal: true
				  	}
				},
	            dangerMode: true
	        }).then(val => {
	        	if (val === 'hide') {
	        		hideConfirmationModal.call({
	                    modalId: 'finish'
	                }, (err, data) => {
	                    if (err) {
	                        notify(err.reason || err.message, 'error')
	                    }
	                })
	        	}

	        	if (val) {
	        		finishWork.call({
						workId: this._id
					}, (err, data) => {
						if (err) {
							notify(err.reason || err.message, 'error')
						}
					})
	        	}
	        })
		} else {
			finishWork.call({
				workId: this._id
			}, (err, data) => {
				if (err) {
					notify(err.reason || err.message, 'error')
				}
			})
		}
	},
	'click #js-remove': function (event, templateInstance) {
		event.preventDefault()

		swal({
            text: `Are you sure you want to remove this timecard? This action is not reversible.`,
            icon: 'warning',
            buttons: {
			  	cancel: {
			    	text: 'No',
			    	value: false,
			    	visible: true,
			    	closeModal: true
			  	},
			  	confirm: {
			    	text: 'Yes',
			    	value: true,
			    	visible: true,
			    	closeModal: true
			  	}
			},
            dangerMode: true
        }).then(confirmed => {
            if (confirmed) {
                deleteWork.call({
					workId: this._id
				}, (err, data) => {
					if (err) {
						notify(err.reason || err.message, 'error')
					}
				})
            }
        })
	}
})
