import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'

const isModerator = userId => {
    let user = Meteor.users.findOne({
        _id: userId
    })

    return user && user.moderator
}

const approvedUser = userId => {
    let user = Meteor.users.findOne({
       _id: userId
    })

    return user && user.profile.hourlyRateApproved
}

export const saveSettings = new ValidatedMethod({
    name: 'saveSettings',
    validate:
        new SimpleSchema({
            name: {
            	type: String,
            	optional: false
            },
            paymentMethod: {
                type: String,
                optional: false
            },
            hourlyRate: {
                type: Number,
                optional: false
            },
            walletAddress: {
                type: String,
                optional: true
            },
            bankDetails: {
                type: String,
                optional: true
            },
            paypalEmail: {
                type: String,
                optional: true
            },
            minpayout: {
                type: String,
                optional: false
            },
            maxpayout: {
                type: String,
                optional: false
            }
        }).validator({
        	 clean: true
        }),
    run({ name, paymentMethod, hourlyRate, walletAddress, bankDetails, paypalEmail, minpayout,maxpayout }) {
        if (!Meteor.userId()) {
    	     throw new Meteor.Error('Error.', 'You have to be logged in.')
    	 }

    	return Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                'profile.name': name,
                'profile.paymentMethod': paymentMethod,
                'profile.hourlyRate': hourlyRate,
                'profile.hourlyRateApproved': false,
                'profile.walletAddress': walletAddress || '',
                'profile.bankDetails': bankDetails || '',
                'profile.paypalEmail': paypalEmail || '',
                'profile.minpayout': minpayout || '',
                'profile.maxpayout': maxpayout || ''
            }
        })
    }
})

export const approveHourlyRate = new ValidatedMethod({
    name: 'approveHourlyRate',
    validate:
        new SimpleSchema({
            userId: {
                type: String,
                optional: false
            }
        }).validator({
             clean: true
        }),
    run({ userId }) {
        if (!Meteor.userId()) {
             throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        if (isModerator(Meteor.userId())) {
            return Meteor.users.update({
                _id: userId
            }, {
                $set: {
                    'profile.hourlyRateApproved': true
                }
            })
        }
    }
})

export const hideConfirmationModal = new ValidatedMethod({
    name: 'hideConfirmationModal',
    validate: new SimpleSchema({
        modalId: {
            type: String,
            optional: false
        }
    }).validator({
        clean: true
    }),
    run({ modalId }) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        return Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $addToSet: {
                hidden: modalId
            }
        })
    }
})

export const resetHiddenModals = new ValidatedMethod({
    name: 'resetHiddenModals',
    validate: new SimpleSchema({}).validator({
        clean: true
    }),
    run({ }) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        return Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                hidden: []
            }
        })
    }
})

export { isModerator, approvedUser }

if (Meteor.isDevelopment) {
    Meteor.methods({
        generateTestUser: () => {
            let user = Meteor.users.findOne({
                username: 'testing'
            })

            if (!user) {
                let uId = Accounts.createUser({
                    username: 'testing',
                    password: 'testing',
                    email: 'testing@testing.test',
                    profile: {
                        name: 'Tester',
                        paymentMethod: 'swift',
                        hourlyRate: 100000,
                        hourlyRateApproved: true,
                        minpayout: '200',
                        maxpayout: '2000'
                    }
                })

                Meteor.users.update({
                    _id: uId
                }, {
                    $set: {
                        moderator: true
                    }
                })
            }
        }
    })
}
