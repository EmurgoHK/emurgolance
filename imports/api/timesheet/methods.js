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



const validateGithubIssue = (issue, provider) => {
	provider = provider.toLowerCase()
	var isValidIssue = false
	var providerUrl = ''

	if (provider === 'github') {
		// add auth to github api calls in order to prevent rate limiting (60 per hour without auth and 5000 per hour with auth)
		// these credentials are from some test app specifically created for this purpose so using them here won't have any effect elsewhere
		providerUrl = `https://api.github.com/repos/${issue}?client_id=59b6ea8f244deea72301&client_secret=d70815c427d0a3b4a9bd4c634b2285a419caaeef`
	}

	if (provider === 'emurgis' ) {
		providerUrl = `http://emurgis.org/api/problems/${issue}`
	} 

	return new Promise((resolve, reject) => {
		HTTP.get(providerUrl, { headers: {
			  'User-Agent': 'EmurgoBot'
    	}}, (err, data) => {
			if (!err && data.statusCode === 200) {
				// checks the url for the issue. This is needed to distinguish between a PR & issue
				if (provider === 'github' && data.data.html_url.includes(issue)) {
					isValidIssue = true
				} else {
					// check if issue is a valid Emurgis issue
					if (data.data && data.data.data._id === issue) {
						isValidIssue = true
					}
				}
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
		if (Meteor.isServer) {
			if (!Meteor.userId()) {
				throw new Meteor.Error('Error.', 'You have to be logged in.')
			}

			let issueTitle = issue.replace(/((http|https):\/\/)?(github.com|emurgis.org)\//, '').replace(/\/+$/, '')
			let isIssueValid = false

			// The link must contain issues in the URL
			if (!issueTitle.includes('/issues/')) {
				isIssueValid = await validateGithubIssue(issueTitle, 'emurgis')
			} else {
				isIssueValid = await validateGithubIssue(issueTitle, 'github')
			}

			if (isIssueValid) {
				let startTime = new Date().getTime()
				let project = issueTitle.split('/').length > 1 ? issueTitle.split('/')[1] : 'Emurgis'
				project = project.toLowerCase()

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
				throw new Meteor.Error('Error.', 'Invalid issue.')
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
        },
        addPayableTimesheet: () => {
        	let startTime = new Date().getTime()
        	let endTime = startTime + 300 * 1000

        	let totalTime = endTime - startTime

        	Timesheet.insert({
  				owner: Meteor.userId(),
  				start: startTime, // original start time
  				startTime: startTime, // changes each time the time is paused
           		project: 'EmurgoHK', // project related to the issue
  				active: false,
  				finished: true,
  				paused: false,
				issue: 'https://github.com/EmurgoHK/Emurgolance/issues/44',
				rate: Meteor.user().profile.hourlyRate, // user's current hourly rate,
				endTime: endTime,
				totalTime: totalTime,
				totalEarnings: (totalTime/(1000*60*60)) * Meteor.user().profile.hourlyRate			  
  			})
        }
    })
}