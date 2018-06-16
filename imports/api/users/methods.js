import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'

const isModerator = userId => {
    let user = Meteor.users.findOne({
        _id: userId
    })

    return user && user.moderator
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
            }
        }).validator({
        	 clean: true
        }),
    run({ name, paymentMethod, hourlyRate }) {
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
                'profile.hourlyRateApproved': false
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

export { isModerator }