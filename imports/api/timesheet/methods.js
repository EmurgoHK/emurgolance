import { Meteor } from 'meteor/meteor'
import { HTTP } from 'meteor/http'
import { Promise } from 'meteor/promise';
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'

import { Timesheet } from './timesheet'

const workManipulationSchema = new SimpleSchema({
    workId: {
       	type: String,
       	optional: false
    }
})

const validateGithubIssue = (issue) => {
	var isValidIssue = false
	return new Promise((resolve, reject) => {
		HTTP.get(`https://api.github.com/repos/${issue}`, { headers: {
      "User-Agent": "gazhayes-blockrazor"
    }}, (err, data) => {
			if (!err && data.data.html_url.includes(issue)) // checks the url for the issue. This is needed to distinguish between a PR & issue
      {
        isValidIssue = true
      }
			resolve(isValidIssue)
		})
	})
}

export const startWork = new ValidatedMethod({
	name: 'startWork',
	validate:
		new SimpleSchema({
			issue: {
				type: SimpleSchema.RegEx.Url,
				optional: false
			}
		}).validator({
			clean: true
		}),
	async run({ issue }) {
  		if (!Meteor.userId()) {
  			throw new Meteor.Error('Error.', 'You have to be logged in.')
  		}

			let issueTitle = issue.replace(/((http|https):\/\/)?github.com\//, '').replace(/\/+$/, '')

      // The link must contain issues in the URL
      if (!issueTitle.includes('/issues/')) {
        throw new Meteor.Error('Error.', 'Please enter a valid github url for an issue')
      }

      if (Meteor.isServer) {
        let isIssueValid = await validateGithubIssue(issueTitle)

  			if (isIssueValid) {
  				let startTime = new Date().getTime()
          let project = issueTitle.split('/')[1]

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
            		project: project, // project related to the issue
  					active: true,
					issue: issue,
					rate: Meteor.user().profile.hourlyRate // user's current hourly rate
					  
  				})
  			} else {
  				throw new Meteor.Error('Error.', 'Invalid Github issue.')
  			}
      }
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
		  
		let totalTime = new Date().getTime() - work.startTime + (work.totalTime || 0)

		return Timesheet.update({
			_id: workId
		}, {
			$set: {
			    paused: true,
			    active: false,
				totalTime: totalTime,
				totalEarnings: (totalTime/(1000*60*60)) * Meteor.user().profile.hourlyRate
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
		  let totalTime = endTime - work.startTime + (work.totalTime || 0)  // have to take care of pauses in between

		return Timesheet.update({
			_id: workId
		}, {
			$set: {
			    finished: true,
			    paused: false,
			    active: false,
			    endTime: endTime,
				totalTime: totalTime,
				totalEarnings: (totalTime/(1000*60*60)) * Meteor.user().profile.hourlyRate
			}
		})
    }
})

if (Meteor.isDevelopment) {
    Meteor.methods({
        removeTestTimesheet: () => { // it's your own fault if you call this in dev :)
            Timesheet.remove({
            	owner: Meteor.userId()
            })
        }
    })
}