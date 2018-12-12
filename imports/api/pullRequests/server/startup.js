import { updateGithubPullRequests } from '../methods';

Meteor.startup(() => {
    SyncedCron.add({
        name: 'Fetch new pull requests',
        schedule: (parser) => parser.cron('*/5 * * * *'), // every 5 minutes will be sufficient
        job: () => updateGithubPullRequests.call({}, (err, data) => {})
    })
})
