import { updateGithubIssues } from '../methods';

Meteor.startup(() => {
    SyncedCron.add({
        name: 'Fetch new issues',
        schedule: (parser) => parser.cron('*/5 * * * *'), // every 5 minutes will be sufficient
        job: () => updateGithubIssues.call({}, (err, data) => {})
    })
})
