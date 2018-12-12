import './issues.html'
import { Issues } from "../../../api/issues/issues";

Template.issues.onCreated(function() {
    this.subscribe('issues')

    Meteor.call('updateGithubIssues');
});

Template.issues.helpers({
    issues() {
        return Issues.find(
            { $nor: [ {labels: 'Done'}, {labels: 'done'}, {labels: 'in progress'}, {labels: 'In progress'} ] }, 
            { sort: {createdAt: -1} }
        ).fetch();
    },
    removeHostname: (url) => {
        return url.replace(/http(s|):\/\/github.com\/(blockrazor|emurgohk)\//i, '')
    },
    projectName: (url) => {
        return url.split('/')[4]
    }
});
