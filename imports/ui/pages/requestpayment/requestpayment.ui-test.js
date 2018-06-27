const assert = require('assert')
const baseUrl = 'http://localhost:3000'

describe('Request payment route', function () {
    before(() => {
        browser.url(`${baseUrl}/`)
        browser.pause(5000)

        browser.execute(() => {
            Meteor.call('generateTestUser', (err, data) => {})

            return 'ok'
        })

        browser.pause(5000)

        browser.execute(() => Meteor.loginWithPassword('testing', 'testing'))

        browser.pause(10000)

        browser.execute(() => Meteor.call('addPayableTimesheet', (err, data) => {}))

        browser.pause(3000)

        browser.url(`${baseUrl}/requestpayment`)
        browser.pause(5000)
    })

    it('it should render correctly', () => {
        assert(browser.isExisting('.container-fluid'), true)
        assert(browser.isVisible('.container-fluid'), true)

        let values = browser.execute(() => $('.text-value-lg.py-3').text()).value.split('$').filter(i => !!i).map(i => Number(i))

        assert(values[0] > 0, true)
        assert(values[1] === 0, true)
    })

    it('user can request a payment', () => {
        let values = browser.execute(() => $('.text-value-lg.py-3').text()).value.split('$').filter(i => !!i).map(i => Number(i))

        browser.click('#js-requestPayment')

        let values2 = browser.execute(() => $('.text-value-lg.py-3').text()).value.split('$').filter(i => !!i).map(i => Number(i))

        assert(values2[0] === 0, true)
        assert(values[0] === values2[1], true)
    })

    it('moderator can mark payments as paid', () => {
        browser.url(`${baseUrl}/moderator/payments`)
        browser.pause(5000)

        let hasNonPaid = browser.execute(() => $('td').text().toLowerCase().includes('not paid')).value

        if (hasNonPaid) {
            browser.click('.paid')

            browser.pause(2000)

            assert(!browser.execute(() => $('td').text().toLowerCase().includes('not paid')).value, true)
        }
    })
})