const assert = require('assert')
const baseUrl = 'http://localhost:3000'

describe('Home route', function () {
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
    })

    it('it should render correctly', () => {
        assert(browser.isExisting('.documents-index'), true)
        assert(browser.isVisible('.documents-index'), true)
    })

    it('user should be able to start working on an issue', () => {
        const issueUrl = 'https://github.com/EmurgoHK/Emurgolance/issues/37'

        browser.setValue('#js-issue', issueUrl)

        browser.pause(2000)

        browser.click('#js-start')

        browser.pause(6000)

        assert(browser.execute(() => $('.documents-index-item').length >= 1).value, true)

        assert(browser.execute((issueUrl) => Array.from($('.documents-index-item').map((ind, el) => $(el).find('td').html())).pop() === issueUrl), true)
    })

    it('user should be able to pause working on an issue', () => {
        browser.click('#js-pause')

        browser.pause(3000)

        assert(browser.isExisting('#js-continue'), true)
        assert(browser.isVisible('#js-continue'), true)
    })

    it('user should be able to continue wokring on an issue', () => {
        browser.click('#js-continue')

        browser.pause(3000)

        assert(browser.isExisting('#js-pause'), true)
        assert(browser.isVisible('#js-pause'), true)
    })

    it('user should be able to finish working on an issue', () => {
        browser.click('#js-finish')

        browser.pause(3000)

        assert(!browser.isExisting('#js-pause'), true)
        assert(!browser.isVisible('#js-pause'), true)

        assert(!browser.isExisting('#js-finish'), true)
        assert(!browser.isVisible('#js-finish'), true)
    })

    it('user shouldn\'t be able to start working if he/she provides an invalid issue', () => {
        const issueUrl = 'testingIssueUrl'

        let oldCount = browser.execute(() => $('.documents-index-item').length).value

        browser.setValue('#js-issue', '')
        browser.pause(2000)
        browser.setValue('#js-issue', issueUrl)

        browser.pause(2000)

        browser.click('#js-start')

        browser.pause(6000)

        assert(browser.execute((oldCount) => $('.documents-index-item').length === oldCount, oldCount).value, true)

        assert(browser.execute((issueUrl) => Array.from($('.documents-index-item').map((ind, el) => $(el).find('td').html())).pop() !== issueUrl), true)
    })

    after(() => {
        browser.pause(3000)

        browser.execute(() => {
            Meteor.call('removeTestTimesheet', (err, data) => {})

            return 'ok'
        })

        browser.pause(5000)
    })
})