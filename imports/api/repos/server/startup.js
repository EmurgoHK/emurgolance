import { Mongo } from 'meteor/mongo'

import { updateGithubRepos } from '/imports/api/repos/methods'

Meteor.startup(() => {
    SyncedCron.add({
        name: 'Fetch new pull requests',
        schedule: (parser) => parser.cron('*/5 * * * *'), // every 5 minutes will be sufficient
        job: () => updateGithubRepos.call({}, (err, data) => {})
    })
})
