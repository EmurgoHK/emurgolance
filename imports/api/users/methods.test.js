import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import './methods'
import { isModerator } from './methods'

import { callWithPromise } from '/imports/api/utilities'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => {
    profile: {
        name: 'Test User'
    }
}

Meteor.users.update = (sel, mod) => { // simulate how mongo does updates
    if (sel === Meteor.userId() || sel._id === Meteor.userId()) {
        let newObj = {}

        if (mod['$set']) {
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
        }

        if (mod['$addToSet'] || mod['$push']) {
            Object.keys(mod['$addToSet'] || mod['$push']).forEach(i => {
                if (i.indexOf('.') !== -1) {
                    let all = i.split('.')

                    let curObj = [(mod['$addToSet'] || mod['$push'])[i]]

                    all.reverse().forEach((j, ind) => { // build the object bottom up
                        if (ind === all.length - 1) {
                            newObj[j] = _.extend(newObj[j] || {}, curObj)
                        }

                        curObj = {
                            [j]: curObj
                        }
                    })
                } else {
                    newObj[i] = [(mod['$addToSet'] || mod['$push'])[i]]
                }
            })
        }

        if (mod['$pull']) {
            Object.keys(mod['$pull']).forEach(i => {
                if (i.indexOf('.') !== -1) { // in case modifier is, for example, 'profile.name'
                    let all = i.split('.')

                    let curObj = []

                    all.reverse().forEach((j, ind) => { // build the object bottom up
                        if (ind === all.length - 1) {
                            newObj[j] = _.extend(newObj[j] || {}, curObj)
                        }

                        curObj = {
                            [j]: curObj
                        }
                    })
                } else {
                    newObj[i] = []
                }
            })
        }

        // hacky solution that seems to work properly here, basically, the main problem is reference sharing between multiple js files and this seems to solve it
        let old = Meteor.users.findOne() || {}
        Meteor.users.findOne = () => _.extend(old, newObj)
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
            paypalEmail: 'random@mail.com',
            minpayout: '200',
            maxpayout: '2000'
        }
        return callWithPromise('saveSettings', update).then(() => {
            let user = Meteor.users.findOne({
                _id: Meteor.userId()
            })

            assert.ok(user)

            Object.keys(update).forEach(i => assert.equal(update[i], user.profile[i]))
        })
    })

    it('user can hide a confirmation modal', () => {
        return callWithPromise('hideConfirmationModal', {
            modalId: 'test'
        }).then(data => {
            let user = Meteor.users.findOne({
                _id: Meteor.userId()
            })

            console.log(user)

            assert.ok(user.hidden && user.hidden.length && ~user.hidden.indexOf('test'))
        })
    })

    it('user can reset hidden confirmation modals', () => {
        return callWithPromise('resetHiddenModals', {}).then(data => {
            let user = Meteor.users.findOne({
                _id: Meteor.userId()
            })

            console.log(user)

            assert.ok(user.hidden && !user.hidden.length)
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
