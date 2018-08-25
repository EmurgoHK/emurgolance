const assert = require('assert')
const baseUrl = 'http://localhost:3000'

describe('Settings route', function () {
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

        browser.url(`${baseUrl}/settings`)
        browser.pause(5000)
    })

    it('it should render correctly', () => {
        assert(browser.isExisting('.container-fluid'), true)
        assert(browser.isVisible('.container-fluid'), true)

        assert(browser.getValue('#js-name') === 'Tester', true)
        assert(browser.execute(() => $('input[name="js-payment"]:checked').val() === 'swift').value, true)
    })

    it('user should be able to set appropriate payment info based on the payment method selected', () => {
        let opts = {
            'paypal-payment': 'js-paypal-email',
            'bitcoin-payment': 'js-wallet-address',
            'cardano-payment': 'js-wallet-address',
            'swift-payment': 'js-bank-details'
        }
        
        Object.keys(opts).forEach(i => {
            browser.click(`#${i}`)
            browser.pause(3000)

            assert(browser.isExisting(`#${opts[i]}`), true)
            assert(browser.isVisible(`#${opts[i]}`), true)
        })
    })

    it('user should be able to update his/her settings', () => {
        browser.setValue('#js-bank-details', 'IBAN: 123')

        browser.pause(2000)

        browser.setValue('#js-hr', 100000)

        browser.pause(2000)

        browser.setValue('#js-minpayout', 200)
        browser.pause(1000)
        browser.setValue('#js-maxpayout', 2000)
        browser.pause(1000)

        browser.click('.btn-primary')

        browser.pause(4000)

        assert(browser.execute(() => FlowRouter.current().route.name).value === 'home', true)

        assert(browser.execute(() => {
            let profile = Meteor.user().profile || {}

            return profile.bankDetails === 'IBAN: 123' && profile.hourlyRate === 100000 && !profile.hourlyRateApproved
        }).value, true)
    })

    it('moderator should be able to accept payment rate change', () => {
        browser.url(`${baseUrl}/moderator/users`)
        browser.pause(5000)

        let count = browser.execute(() => $('.user-item').length).value || 1

        browser.click('.approve')
        browser.pause(2000)
        browser.click('.swal-button--confirm')
        browser.pause(3000)

        assert(browser.execute(count => $('.user-item').length === count - 1, count).value, true)
    })

    it('should redirect user back to home if he/she logs out', () => {
        browser.url(`${baseUrl}/settings`)

        browser.pause(6000)

        browser.execute(() => Meteor.logout())

        browser.pause(4000)

        assert(browser.execute(() => FlowRouter.current().route.name === 'home').value, true)
    })

    it('if the user is not logged in, it should show a message and redirect him/her back to home', () => {
        browser.url(`${baseUrl}/settings`)

        browser.pause(7000)
        
        assert(browser.execute(() => FlowRouter.current().route.name === 'home').value, true)
    })
})