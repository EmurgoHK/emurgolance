import './issues.html';
import './issues.scss';

import { Issues } from "../../../api/issues/issues";
import { Updates } from '../../../api/updates/updates';

Template.issues.onCreated(function() {
    this.subscribe('issues');
    this.subscribe('updates.last', {api: 'GitHub', callType: 'issues'});

    this.lastUpdate = new ReactiveVar(new Date().getTime());
})

Template.repos.onRendered(function() {
    Template.lastUpdate
    this.autorun(() => {
        // We update the last updated display and disable the spinning animation
        this.lastUpdate.set(Math.min(...Updates.find().map(a => a.timestamp)));
        Template.instance().$('.refreshButton').removeClass('refreshing');
    });
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
    },
    lastUpdated: () => Template.instance().lastUpdate.get(),
});

Template.issues.events({
    'click .refreshButton': (ev, tpl) => {
        tpl.$('.refreshButton').addClass('refreshing');
        Meteor.call('updateGithubIssues');
    }
});