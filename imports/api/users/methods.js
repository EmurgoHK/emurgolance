import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'

export const saveDetails = new ValidatedMethod({
    name: 'saveDetails',
    validate:
        new SimpleSchema({
            name: {
            	type: String,
            	optional: false
            },
            paymentMethod: {
                type: String,
                optional: false
            }
        }).validator({
        	 clean: true
        }),
    run({ name, paymentMethod }) {
        if (!Meteor.userId()) {
    	     throw new Meteor.Error('Error.', 'You have to be logged in.')
    	 }

    	return Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                'profile.name': name,
                'profile.paymentMethod': paymentMethod
            }
        })
    }
})
