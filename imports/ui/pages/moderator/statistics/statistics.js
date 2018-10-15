import "./statistics.html"
import { Timesheet } from '/imports/api/timesheet/timesheet'

Template.statistics.onCreated(function() {
    this.autorun(() => {
        this.subscribe('timesheet.mod');
    })
})

Template.statistics.helpers({
    projectsAmount () {
        return Timesheet.find({
            status: {
                $ne: 'payment-rejected'
            }
        }).fetch().map(obj => {
            var result = {}

            if (obj.totalEarnings === undefined) obj.totalEarnings = 0.00
            result[obj.project.toLowerCase()] = obj.totalEarnings
            return result
        }).reduce((acc, curr) => {
            var found = undefined

            for (prop in curr) {
                found = acc.find(obj => {
                    for (key in obj) { return key === prop }
                })

                if (found === undefined) {
                    acc.push(curr)
                    return acc
                }

                found[prop] += curr[prop]
            }

            return acc
        }, []).map(obj => {
            var result = {}

            for (const key in obj) {
                result['project'] = key
                result['earnings'] = obj[key]
            }
            
            return result
        })
    },
    freelancers () {
        var freelancers = [];
        var results = Timesheet.find({}).fetch()

        for (let index = 0; index < results.length; index++) {
            const element = results[index]
            const found = freelancers.find(obj => {return obj.userId === element.owner})

            if (found === undefined)
                freelancers.push({userId: element.owner})
        }

        return freelancers
    },
    userAmounts (owner, project) {
        return Timesheet.find({ owner: owner, status: {
            $ne: 'payment-rejected'
        }}).fetch().map(obj => {
            if (obj.project.toLowerCase() === project) return obj.totalEarnings
        }).reduce((acc, curr) => {
            if (curr === undefined) return acc + 0
            return acc + curr
        }, 0).toFixed(2)
    },
    userProfile (userId) {
        const user = Meteor.users.findOne({ _id : userId})

        if (user && user.profile === undefined) 
            return user.services.github.email

        if (user) 
            return user.profile.name 
    },
    fixed: val => val ? val.toFixed(2) : '0.00'
})