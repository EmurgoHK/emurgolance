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
    })

    it('user can request a payment', () => {
        let values = browser.execute(() => $('.text-value-lg.py-3').text()).value.split('$').filter(i => !!i).map(i => Number(i))

        browser.click('#js-requestPayment')

        let values2 = browser.execute(() => $('.text-value-lg.py-3').text()).value.split('$').filter(i => !!i).map(i => Number(i))

        assert(values2[0] === 0, true)
    })

    it('payment request should show up on the home dashboard', () => {
        browser.url('/')
        browser.pause(7000)

        assert(browser.isExisting('.dashboard'), true)
        assert(browser.isVisible('.dashboard'), true)

        assert(browser.execute(() => Number($($($('.dashboard').find('.card-body')[2]).find('div')[0]).text().slice(-1))).value > 0, true)
    })

    it('moderator can see correct data and mark payments as paid', () => {
        browser.url(`${baseUrl}/moderator/payments`)
        browser.pause(5000)

        let hasNonPaid = browser.execute(() => $('td').text().toLowerCase().includes('not paid')).value

        if (hasNonPaid) {
            browser.click('.review')

            browser.pause(5000)

            // get sum of projects
            let projectsSum = browser.execute(() => Array.from($('.breakdown').find('tr').map((e, i) => Number($($(i).find('td').get(1)).text().trim().slice(1)))).reduce((i1, i2) => i1 + i2, 0)).value
            let timesheetsSum = browser.execute(() => Array.from($('.timesheets').find('tr').map((e, i) => Number($($(i).find('td').get(6)).text().trim().slice(1)))).reduce((i1, i2) => i1 + i2, 0)).value
            let totalPending = browser.execute(() => Number($('.total-pending').text().slice(2))).value

            assert(Math.abs(projectsSum - timesheetsSum) < 1, true)
            assert(Math.abs(totalPending - timesheetsSum) < 1, true)
            assert(Math.abs(projectsSum - totalPending) < 1, true)

            browser.pause(2000)

            browser.click('.paid')

            browser.pause(6000)

            assert(browser.execute(() => FlowRouter.current().route.name === 'home').value, true)
        }
    })

    it('payment paid status should show up on the home dashboard', () => {
        browser.url('/')
        browser.pause(5000)

        assert(browser.isExisting('.dashboard'), true)
        assert(browser.isVisible('.dashboard'), true)
 
        assert(browser.execute(() => Number($($($('.dashboard').find('.card-body')[3]).find('div')[0]).text().slice(-1))).value > 0, true)
    })

    after(() => {
        browser.pause(3000)
        browser.execute(() => Meteor.call('removePayments', (err, data) => {}))
    })
})