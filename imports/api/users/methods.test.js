import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import './methods'
import { isModerator } from './methods'

import { callWithPromise } from '/imports/api/utilities'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
userObj = {
    profile: {
        name: 'Test User'
    }
}

Meteor.users.findOne = () => userObj // stub user data as well
Meteor.user = () => userObj

Meteor.users.update = (sel, mod) => { // simulate how mongo does updates
    if (sel === Meteor.userId() || sel._id === Meteor.userId()) {
        let newObj = {}

        Object.keys(mod['$set']).forEach(i => {
            if (i.indexOf('.') !== -1) { // in case modifier is, for example, 'profile.name'
                let all = i.split('.')

                let curObj = mod['$set'][i]

                all.reverse().forEach((j, ind) => { // build the object bottom up
                    if (ind === all.length - 1) {
                        newObj[j] = _.extend(newObj[j] || {}, curObj)
                    }

                    curObj = {
                        [j]: curObj
                    }
                })
            } else {
                newObj[i] = mod['$set'][i]
            }
        })

        userObj = _.extend(userObj, newObj)
    }
}

describe('User methods', () => {
    it('user can update his/her settings', () => {
        const update = {
            name: 'Testing', 
            paymentMethod: 'swift',
            hourlyRate: 100,
            walletAddress: 'randomAddress',
            bankDetails: 'randomDetails',
            paypalEmail: 'random@mail.com'
        }
        return callWithPromise('saveSettings', update).then(() => {
            let user = Meteor.users.findOne({
                _id: Meteor.userId()
            })

            assert.ok(user)

            Object.keys(update).forEach(i => assert.equal(update[i], user.profile[i]))
        })
    })

    it('isModerator check works', () => {
        assert.notOk(isModerator(Meteor.userId()))

        Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                moderator: true
            }
        })

        assert.ok(isModerator(Meteor.userId()))
    })
})
