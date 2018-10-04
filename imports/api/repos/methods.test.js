import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import './methods'
import { Repos } from './repos'

import { callWithPromise } from '/imports/api/utilities'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ profile: { name: 'Test User', hourlyRate: 2000 } }) // stub user data as well
Meteor.user = () => ({ profile: { name: 'Test User', hourlyRate: 2000 } })

describe('Repo methods', function() {
    this.timeout(60000)
    
    it('repos can be fetched from github', () => {
        return callWithPromise('updateGithubRepos', {}).then(data => {
            let repos = Repos.find({}).fetch()

            assert.ok(repos)

            if (repos.length > 0) {
                assert.ok(repos.length > 0)
                assert.ok(repos[0].repo)
                assert.ok(repos[0].issueCount >= 0)
                assert.ok(repos[0].pullCount >= 0)
            }
        }).catch(err => {})
    })
})
