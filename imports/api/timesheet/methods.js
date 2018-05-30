import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'

import { Timesheet } from './timesheet'

const workManipulationSchema = new SimpleSchema({
    workId: {
       	type: String,
       	optional: false
    }
})

export const startWork = new ValidatedMethod({
    name: 'startWork',
    validate:
        new SimpleSchema({
            issue: {
            	type: SimpleSchema.RegEx.Domain,
            	optional: false
            }
        }).validator({
        	clean: true
        }),
    run({ issue }) {
    	if (!Meteor.userId()) {
    		throw new Meteor.Error('Error.', 'You have to be logged in.')
    	}

    	let startTime = new Date().getTime()

    	let prevWork = Timesheet.findOne({
    		owner: Meteor.userId(),
    		active: true
    	})

    	if (prevWork) {
    		throw new Meteor.Error('Error.', 'You can only start one task at a time.')
    	}

	    return Timesheet.insert({
	    	owner: Meteor.userId(),
	    	start: startTime, // original start time
	    	startTime: startTime, // changes each time the time is paused
	    	active: true,
	    	issue: issue
	    })
    }
})

export const pauseWork = new ValidatedMethod({
    name: 'pauseWork',
    validate: workManipulationSchema.validator({
        clean: true
    }),
    run({ workId }) {
    	if (!Meteor.userId()) {
    		throw new Meteor.Error('Error.', 'You have to be logged in.')
    	}

  		let work = Timesheet.findOne({
  			owner: Meteor.userId(),
  			_id: workId
  		})

		if (!work) {
			throw new Meteor.Error('Error.', 'Invalid id.')
		}

  		if (!work.active) {
  			throw new Meteor.Error('Error.', 'You can\'t pause work that\'s has been completed.')
  		}
		
		return Timesheet.update({
			_id: workId
		}, {
			$set: {
			    paused: true,
			    active: false,
			    totalTime: new Date().getTime() - work.startTime + (work.totalTime || 0)
			}
		})
    }
})

export const continueWork = new ValidatedMethod({
    name: 'continueWork',
    validate: workManipulationSchema.validator({
        clean: true
    }),
    run({ workId }) {
    	if (!Meteor.userId()) {
    		throw new Meteor.Error('Error.', 'You have to be logged in.')
    	}

  		let work = Timesheet.findOne({
  			owner: Meteor.userId(),
  			_id: workId
  		})

		if (!work) {
			throw new Meteor.Error('Error.', 'Invalid id.')
		}

  		if (!work.paused) {
  			throw new Meteor.Error('Error.', 'You can\'t continue work that\'s hasn\'t been paused.')
  		}
		
		return Timesheet.update({
			_id: workId
		}, {
			$set: {
			    paused: false,
			    active: true,
			    startTime: new Date().getTime()
			}
		})
    }
})

export const finishWork = new ValidatedMethod({
    name: 'finishWork',
    validate: workManipulationSchema.validator({
        clean: true
    }),
    run({ workId }) {
    	if (!Meteor.userId()) {
    		throw new Meteor.Error('Error.', 'You have to be logged in.')
    	}

  		let work = Timesheet.findOne({
  			owner: Meteor.userId(),
  			_id: workId
  		})

		if (!work) {
			throw new Meteor.Error('Error.', 'Invalid id.')
		}

  		if (!work.active) {
  			throw new Meteor.Error('Error.', 'You can\'t finish work that\'s not active.')
  		}

  		let endTime = new Date().getTime()
		
		return Timesheet.update({
			_id: workId
		}, {
			$set: {
			    finished: true,
			    paused: false,
			    active: false,
			    endTime: endTime,
			    totalTime: endTime - work.startTime + (work.totalTime || 0) // have to take care of pauses in between
			}
		})
    }
})