const assert = require('assert')
const baseUrl = 'http://localhost:3000'

describe('User list route', function () {
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

        browser.url(`${baseUrl}/moderator/users`)
        browser.pause(5000)
    })

    it('it should render correctly', () => {
        assert(browser.isExisting('.card'), true)
        assert(browser.isVisible('.card'), true)

        assert(browser.execute(() => $('.user-item').length > 0).value, true)
    })

    it('moderator can view user details', () => {
        browser.click('.btn-primary')
        browser.pause(3000)

        assert(browser.execute(() => !!FlowRouter.getParam('id')).value, true)
        assert(browser.execute(() => $('.documents-index-item').length > 0).value, true)
    })
})