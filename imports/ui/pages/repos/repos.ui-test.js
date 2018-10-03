const assert = require('assert')
const baseUrl = 'http://localhost:3000'

describe('Repos route', function () {
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

        browser.url(`${baseUrl}/moderator/repos`)
        browser.pause(10000)
    })

    it('it should render correctly', () => {
        assert(browser.isExisting('.card'), true)
        assert(browser.isVisible('.card'), true)

        assert(browser.execute(() => $('.repo-index-item').length >= 0).value, true)
    })
})