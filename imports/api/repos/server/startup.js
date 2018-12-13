import { updateGithubRepos } from "/imports/api/repos/methods";

Meteor.startup(() => {
  SyncedCron.add({
    name: "Fetch new repos",
    schedule: parser => parser.cron("*/5 * * * *"), // every 5 minutes will be sufficient
    job: () => updateGithubRepos.call({}, (err, data) => {})
  });
});
