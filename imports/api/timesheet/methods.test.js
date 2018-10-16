import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import { Timesheet } from './timesheet'
import './methods'

import { callWithPromise } from '/imports/api/utilities'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ profile: { name: 'Test User'} }) // stub user data as well
Meteor.user = () => ({ profile: { name: 'Test User'} })

describe('Timesheet methods', () => {
    
    it('user can start working on a valid issue', () => {
        const issue = 'https://github.com/EmurgoHK/emurgolance/issues/67'

        return callWithPromise('startWork', {
            issue: issue
        }).then(tId => {
            let timesheet = Timesheet.findOne({
                _id: tId
            })

            assert.ok(timesheet)
            assert.equal(timesheet.issue, issue)
            assert.ok(timesheet.active)
            assert.equal(timesheet.project, 'Emurgolance'.toLowerCase())
        })
    }).timeout(15000)

    it('user cannot start working on an invalid issue', () => {
        const issue = 'testing'

        return callWithPromise('startWork', {
            issue: issue
        }).then(tId => {
            assert.isNull(tId)
        }).catch(err => {
            assert.include(err.message.toLowerCase(), 'invalid issue')
        })
    }).timeout(15000)

    it('user cannot start working on two issues at the same time', () => {
        const issue = 'https://github.com/EmurgoHK/emurgolance/issues/67'

        return callWithPromise('startWork', {
            issue: issue
        }).then(tId => {
            assert.isNull(tId)
        }).catch(err => {
            assert.include(err.message, 'You can only start one task at a time')
        })
    }).timeout(15000)

    it('user can pause working on an issue', () => {
        let work = Timesheet.findOne({
            owner: Meteor.userId(),
            active: true
        })

        assert.ok(work)

        return callWithPromise('pauseWork', {
            workId: work._id
        }).then(tId => {
            let timesheet = Timesheet.findOne({
                _id: work._id
            })

            assert.ok(timesheet)
            assert.ok(timesheet.paused)
            assert.notOk(timesheet.active)
            assert.ok(timesheet.totalTime > 0)
        })
    })

    it('user cannot pause working on an inactive issue', () => {
        let work = Timesheet.findOne({
            owner: Meteor.userId(),
            active: false
        })

        assert.ok(work)

        return callWithPromise('pauseWork', {
            workId: work._id
        }).then(tId => {
            assert.isNull(tId)
        }).catch(err => {
            assert.include(err.message, 'You can\'t pause work that\'s has been completed')
        })
    })

    it('user can continue working on an issue', () => {
        let work = Timesheet.findOne({
            owner: Meteor.userId(),
            paused: true
        })

        assert.ok(work)

        return callWithPromise('continueWork', {
            workId: work._id
        }).then(tId => {
            let timesheet = Timesheet.findOne({
                _id: work._id
            })

            assert.ok(timesheet)
            assert.notOk(timesheet.paused)
            assert.ok(timesheet.active)
            assert.ok(timesheet.totalTime > 0)
        })
    })

    it('user cannot continue working on an issue that has\'t been paused', () => {
        let work = Timesheet.findOne({
            owner: Meteor.userId(),
            paused: false
        })

        assert.ok(work)

        return callWithPromise('continueWork', {
            workId: work._id
        }).then(tId => {
            assert.isNull(tId)
        }).catch(err => {
            assert.include(err.message, 'You can\'t continue work that\'s hasn\'t been paused')
        })
    })

    it('user can\'t continue working on an issue if there is another issue active', () => {
        const startTime = new Date().getTime();
        let work = Timesheet.insert({
            owner: Meteor.userId(),
            start: startTime, // original start time
            startTime: startTime, // changes each time the time is paused
            project: 'Test project', // project related to the issue
            active: false,
            paused: true,
            issue: 'https://github.com/EmurgoHK/Emurgolance/issues/44',
            rate: Meteor.user().profile.hourlyRate // user's current hourly rate
        })

        assert.ok(work)

        return callWithPromise('continueWork', {
            workId: work
        }).then(() => {
            assert.fail('', '', 'User could start on multiple tasks'); // actual, expected, message
        }, err => {
            assert.include(err.message, 'You can only start one task at a time')
        });
    })

    it('user can edit time spent working on an issue', () => {
        let work = Timesheet.findOne({
            owner: Meteor.userId()
        })

        assert.ok(work)

        return callWithPromise('editWork', {
            workId: work._id,
            newTotal: 600000, // 00:10:00
            reason: 'Test reason'
        }).then(tId => {
            let timesheet = Timesheet.findOne({
                _id: work._id
            })

            assert.ok(timesheet)
            assert.ok(timesheet.history.length > 0)
            assert.ok(timesheet.history.some(i => i.reason === 'Test reason'))
            assert.ok(timesheet.totalTime >= 600000)
        })
    })

    it('user can finish working on an issue with a valid PR link', () => {
        let work = Timesheet.findOne({
            owner: Meteor.userId(),
            active: true
        })

        assert.ok(work)

        return callWithPromise('finishWork', {
            workId: work._id,
            pr: 'https://github.com/EmurgoHK/emurgolance/pull/116'
        }).then(tId => {
            let timesheet = Timesheet.findOne({
                _id: work._id
            })

            assert.ok(timesheet)
            assert.notOk(timesheet.paused)
            assert.notOk(timesheet.active)
            assert.ok(timesheet.finished)
            assert.ok(timesheet.totalTime > 0)
        })
    })

    it('user cannot finish working on an issue that\'s not currently active', () => {
        let work = Timesheet.findOne({
            owner: Meteor.userId(),
            active: false
        })

        assert.ok(work)

        return callWithPromise('finishWork', {
            workId: work._id,
            pr: 'https://github.com/EmurgoHK/emurgolance/pull/116'
        }).then(tId => {
            assert.isNull(tId)
        }).catch(err => {
            assert.include(err.message, 'You can\'t finish work that\'s not active')
        })
    })

    it('user can finish working on an issue with a pr link -', () => {
        Timesheet.update({ owner: Meteor.userId() }, {
            $set : { active : true }
        })

        let work = Timesheet.findOne({
            owner: Meteor.userId(),
            active: true
        })

        assert.ok(work)
        
        return callWithPromise('finishWork', {
            workId: work._id,
            pr: '-'
        }).then(tId => {
            let timesheet = Timesheet.findOne({
                _id: work._id
            })

            assert.ok(timesheet)
            assert.notOk(timesheet.paused)
            assert.notOk(timesheet.active)
            assert.ok(timesheet.finished)
            assert.ok(timesheet.totalTime > 0)
        })
    })

    it('user cannot finish working on an issue with an invalid pr link', () => {
        Timesheet.update({ owner: Meteor.userId() }, {
            $set : { active : true }
        })

        let work = Timesheet.findOne({
            owner: Meteor.userId(),
            active: true
        })

        assert.ok(work)

        return callWithPromise('finishWork', {
            workId: work._id,
            pr: 'https://github.com/EmurgoHK/emurgolance/pull/115'
        }).then(tId => {
            assert.isNull(tId)
        }).catch(err => {
            assert.include(err.message, 'Please enter a valid link to the PR')
        })
    })

    it('user can remove a timecard if necessary', () => {
        let work = Timesheet.findOne({
            owner: Meteor.userId()
        })

        assert.ok(work)

        return callWithPromise('deleteWork', {
            workId: work._id
        }).then(tId => {
            let timesheet = Timesheet.findOne({
                _id: work._id
            })

            assert.notOk(timesheet)
        })
    })

    it('dashboard data is calculated correctly', () => {
        return callWithPromise('calcDashboard', {}).then(data => {
            let timesheets = Timesheet.find({}).fetch()

            assert.equal(data.openWork, timesheets.filter(j => !j.finished).length)
            assert.equal(data.completedWork, timesheets.filter(j => !!j.finished).length)
            assert.equal(Math.round(data.totalPayments), Math.round(timesheets.filter(j => j.status === 'payment-paid').reduce((i1, i2) => i1 + (i2.totalEarnings || 0), 0)))
            assert.equal(Math.round(data.pendingPayments), Math.round(timesheets.filter(j => j.status === 'payment-inprogress').reduce((i1, i2) => i1 + (i2.totalEarnings || 0), 0)))
        })
    })

    after(function() {
        Timesheet.remove({
            owner: Meteor.userId()
        })
    })
})
