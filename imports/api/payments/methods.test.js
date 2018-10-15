import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import { Payments } from './payments'
import { Timesheet } from '/imports/api/timesheet/timesheet'

import './methods'

import { callWithPromise } from '/imports/api/utilities'
import { ManualPayments } from '../manual-payments/manual-payments';

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
        });

        Timesheet.insert({
            owner: Meteor.userId(),
            start: startTime,
            startTime: startTime,
            project: 'EmurgoHK',
            active: true,
            issue: 'https://github.com/EmurgoHK/Emurgolance/issues/44',
            rate: Meteor.user().profile.hourlyRate // user's current hourly rate
        });
    })

    it('user can request a payment', () => {
        let unpaidTimesheets = Timesheet.find({
            owner: Meteor.userId(),
            status: {
                $exists: false
            }
        }).fetch()

        assert.ok(unpaidTimesheets.length > 0)

        return callWithPromise('requestPayment', {}).then(data => {
            assert.ok(data)

            let payment = Payments.findOne({
                status: 'not-paid',
                owner: Meteor.userId()
            })

            assert.ok(payment)         

            unpaidTimesheets.forEach(i => {
                let t = Timesheet.findOne({
                    _id: i._id
                })

                assert.equal(t.paymentId, payment._id)
                assert.equal(t.status, 'payment-inprogress')
            })
        })
    })

    it('user can mark payments as paid', () => {
        let startTime = new Date().getTime()

        let payment = Payments.findOne({
            owner: Meteor.userId()
        })

        assert.ok(payment)

        ManualPayments.insert({
            paymentId: payment._id,
            summary: 'Test manual payment 1',
            amount: 1000,
            userId: Meteor.userId(),
            createdAt: startTime,
            status: "payment-inprogress",
        });

        ManualPayments.insert({
            paymentId: payment._id,
            summary: 'Test manual payment 2',
            amount: 1000,
            userId: Meteor.userId(),
            createdAt: startTime,
            status: "payment-inprogress",
        });

        // fetch related timesheets.
        const [timesheetToApprove, ...timesheetsToReject] = Timesheet.find({
            paymentId: payment._id
        }).fetch().map(i => i._id);

        // fetch related manual payments
        const [manualPaymentToApprove, ...manualPaymentsToReject] = ManualPayments.find({
            paymentId: payment._id
        }).fetch().map(i => i._id);


        return callWithPromise('markAsPaid', {
            paymentId: payment._id,
            approvedTimesheets: [timesheetToApprove],
            notApprovedTimesheets: timesheetsToReject.map(tsID => ({_id: tsID, rejectReason: "Test reason"})),
            approvedManualPayments: [manualPaymentToApprove],
            notApprovedManualPayments: manualPaymentsToReject.map(mpID => ({_id: mpID, rejectReason: "Test reason"})),
        }).then(data => {
            let p = Payments.findOne({
                _id: payment._id,
            })

            assert.ok(p)
            assert.equal(p.status, 'payment-paid')

            let approvedTimesheet = Timesheet.findOne({
                _id: timesheetToApprove,
            });

            assert.ok(approvedTimesheet)
            assert.equal(approvedTimesheet.status, 'payment-paid');

            let notApprovedTimesheets = Timesheet.find({
                _id: {
                    $in: timesheetsToReject,
                }
            }).fetch();

            assert.ok(notApprovedTimesheets.length > 0)

            notApprovedTimesheets.forEach(i => {
                assert.equal(i.status, 'payment-rejected')
            })

            let approvedManualPayment = ManualPayments.findOne({
                _id: manualPaymentToApprove
            })

            assert.ok(approvedManualPayment);
            assert.equal(approvedManualPayment.status, 'payment-paid');

            const rejectedManualPayments = ManualPayments.find({
                _id: {
                    $in: manualPaymentsToReject,
                },
            }).fetch();

            assert.ok(rejectedManualPayments.length > 0)

            rejectedManualPayments.forEach(manualPayment => {
                assert.equal(manualPayment.status, 'payment-rejected')
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
