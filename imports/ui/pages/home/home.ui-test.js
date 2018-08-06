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
        const issueUrl = 'https://github.com/EmurgoHK/emurgolance/issues/67'

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

    it('user should be able to modify time spent working on an issue', () => {
        browser.click('#js-edit')

        browser.pause(3000)

        assert(browser.execute(() => FlowRouter.current().route.name === 'entry').value, true)

        assert(browser.isExisting('#js-edit'), true)
        assert(browser.isVisible('#js-edit'), true)

        browser.click('#js-edit')
        browser.pause(800)
        assert(browser.execute(() => $('.noty_body').text().includes('Difference between total times can\'t be zero.')))

        browser.setValue('#js-totalTime', '')
        browser.pause(1000)
        browser.setValue('#js-totalTime', '00:00:00')
        browser.pause(3000)
        browser.click('#js-edit')
        browser.pause(800)
        assert(browser.execute(() => $('.noty_body').text().includes('New total time can\'t be zero.')))

        browser.setValue('#js-totalTime', '')
        browser.pause(1000)
        browser.setValue('#js-totalTime', '00:10:00')
        browser.pause(3000)

        browser.click('#js-edit')
        browser.pause(3000)

        assert(browser.isExisting('.documents-index-item'))
        assert(browser.isVisible('.documents-index-item'))

        assert(browser.execute(() => $($('.documents-index-item').find('td').get(2)).text().includes('+')).value, true)

        browser.pause(3000)

        browser.url(`${baseUrl}/`)
        browser.pause(5000)
    })

    it('user should be able to delete a timecard', () => {
        let oldLength = browser.execute(() => $('.documents-index-item').length).value

        browser.click('#js-remove')

        browser.pause(3000)

        let newLength = browser.execute(() => $('.documents-index-item').length).value

        assert(oldLength === newLength + 1, true)
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