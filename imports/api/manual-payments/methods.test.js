import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import { Payments } from '../payments/payments'
import { ManualPayments } from './manual-payments';

import './methods'

import { callWithPromise } from '/imports/api/utilities'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ profile: { name: 'Test User', hourlyRate: 2000 } }) // stub user data as well
Meteor.user = () => ({ profile: { name: 'Test User', hourlyRate: 2000 } })

describe('Manual payment methods', () => {
    const baseAmount = Meteor.user().profile.hourlyRate;
    let paymentIdNotPaid, paymentIdPaid, paymentIdOtherUser;
    let manualPaymentIdOtherUser, manualPaymentIdPaid;

    before(function() {
        paymentIdNotPaid = Payments.insert({
            amount: baseAmount,
            status: 'not-paid',
            owner: Meteor.userId(),
            paymentMethod: '',
            paymentDetails: '',
            createAt: new Date().getTime(),
        });

        paymentIdPaid = Payments.insert({
            amount: baseAmount,
            status: 'payment-paid',
            owner: Meteor.userId(),
            paymentMethod: '',
            paymentDetails: '',
            createAt: new Date().getTime(),
        });

        manualPaymentIdPaid = ManualPayments.insert({
            paymentId: paymentIdPaid,
            summary: 'Test manual payment 1',
            amount: 0,
            userId: Meteor.userId(),
            createdAt: new Date().getTime(),
            status: "payment-paid",
        });

        paymentIdOtherUser = Payments.insert({
            amount: baseAmount,
            status: 'payment-paid',
            owner: Meteor.userId() + 'not',
            paymentMethod: '',
            paymentDetails: '',
            createAt: new Date().getTime(),
        });

        manualPaymentIdOtherUser = ManualPayments.insert({
            paymentId: paymentIdOtherUser,
            summary: 'Test manual payment 2',
            amount: 1000,
            userId: Meteor.userId() + 'not',
            createdAt: new Date().getTime(),
            status: "payment-inprogress",
        });
    });

    it('user can not request a manual payment for paid payments', () => {
        return callWithPromise('requestManualPayment', {
            paymentId: paymentIdPaid,
            summary: 'TestSummary',
            amount: 1
        }).then(() => assert.fail('', '', 'Did not throw'), (err) => {
            assert.ok(err);
            // TODO: Add asserts about the error;
        });
    });

    it('user can not request a manual payment for payments of other users', () => {
        return callWithPromise('requestManualPayment', {
            paymentId: paymentIdOtherUser,
            summary: 'TestSummary',
            amount: 1
        }).then(() => assert.fail('', '', 'Did not throw'), (err) => {
            assert.ok(err);
            // TODO: Add asserts about the error;
        });
    });

    it('user can request a manual payment for not-paid payments', () => {
        const testSummary = 'TestSummary';
        const testAmount = 1;

        return callWithPromise('requestManualPayment', {
            paymentId: paymentIdNotPaid,
            summary: testSummary,
            amount: testAmount,
        }).then((manualPaymentId) => {
            const manualPayment = ManualPayments.findOne({_id: manualPaymentId});
            assert.ok(manualPayment);

            assert.equal(manualPayment.paymentId, paymentIdNotPaid);
            assert.equal(manualPayment.amount, testAmount);
            assert.equal(manualPayment.summary, testSummary);
            assert.equal(manualPayment.status, 'payment-inprogress');

            const payment = Payments.findOne({_id: paymentIdNotPaid})
            assert.equal(payment.amount, baseAmount + testAmount);
        });
    });

    it('users can remove a manual payment request', () => {
        const manualPayment = ManualPayments.findOne({paymentId: paymentIdNotPaid});
        return callWithPromise('removeManualPayment', {id: manualPayment._id}).then(() => {
            const payment = Payments.findOne({_id: paymentIdNotPaid})
            assert.equal(payment.amount, baseAmount);
        });
    });

    
    it('users can not remove a manual payment request for other users', () => {
        return callWithPromise('removeManualPayment', {id: manualPaymentIdOtherUser}).then(
            () => assert.fail('', '', 'Did not throw'), 
            (err) => {
                assert.ok(err); // TODO: Add asserts about the error;
            });
    });
    
    it('users can not remove a manual payment request that was already paid', () => {
        return callWithPromise('removeManualPayment', {id: manualPaymentIdPaid}).then(
            () => assert.fail('', '', 'Did not throw'), 
            (err) => {
                assert.ok(err); // TODO: Add asserts about the error;
            });
    });

    after(function() {
        ManualPayments.remove({
            userId: Meteor.userId()
        })

        Payments.remove({
            owner: Meteor.userId()
        })

        Payments.remove({
            owner: Meteor.userId() + 'not'
        })
    })
})
