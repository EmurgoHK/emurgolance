import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import { Payments } from './payments'
import { Timesheet } from '/imports/api/timesheet/timesheet'

import './methods'

import { callWithPromise } from '/imports/api/utilities'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ profile: { name: 'Test User', hourlyRate: 2000 } }) // stub user data as well
Meteor.user = () => ({ profile: { name: 'Test User', hourlyRate: 2000 } })

describe('Timesheet methods', () => {
    before(function() {
        let startTime = new Date().getTime()

        Timesheet.insert({
            owner: Meteor.userId(),
            start: startTime,
            startTime: startTime,
            project: 'EmurgoHK',
            active: true,
            issue: 'https://github.com/EmurgoHK/Emurgolance/issues/44',
            rate: Meteor.user().profile.hourlyRate // user's current hourly rate
        })
    })

    it('user can request a payment', () => {
        let unpaid = Timesheet.find({
            owner: Meteor.userId(),
            status: {
                $exists: false
            }
        }).fetch()

        assert.ok(unpaid.length > 0)

        return callWithPromise('requestPayment', {}).then(data => {
            assert.ok(data)

            let payment = Payments.findOne({
                status: 'not-paid',
                owner: Meteor.userId()
            })

            assert.ok(payment)         

            unpaid.forEach(i => {
                let t = Timesheet.findOne({
                    _id: i._id
                })

                assert.equal(t.paymentId, payment._id)
                assert.equal(t.status, 'payment-inprogress')
            })
        })
    })

    it('user can mark payments as paid', () => {
        let payment = Payments.findOne({
            owner: Meteor.userId()
        })

        assert.ok(payment)

        return callWithPromise('markAsPaid', {
            paymentId: payment._id,
            approvedTimesheets: Timesheet.find({
                paymentId: payment._id
            }).fetch().map(i => i._id),
            notApprovedTimesheets: []
        }).then(data => {
            let p = Payments.findOne({
                _id: payment._id
            })

            assert.ok(p)
            assert.equal(p.status, 'payment-paid')

            let ts = Timesheet.find({
                paymentId: payment._id
            }).fetch()

            assert.ok(ts.length > 0)

            ts.forEach(i => {
                assert.equal(i.status, 'payment-paid')
            })
        })
    })

    after(function() {
        Timesheet.remove({
            owner: Meteor.userId()
        })

        Payments.remove({
            owner: Meteor.userId()
        })
    })
})
