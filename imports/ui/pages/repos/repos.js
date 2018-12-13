import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Repos } from '/imports/api/repos/repos'

import './repos.html'
import { Issues } from '../../../api/issues/issues';
import { PullRequests } from '../../../api/pullRequests/pullRequests';
import { Updates } from '../../../api/updates/updates';

Template.repos.onCreated(function reposCreated() {
    this.activeRepos = new ReactiveVar([])

    this.autorun(() => this.subscribe('repos'))
    this.autorun(() => this.subscribe('issues.repo'))
    this.autorun(() => this.subscribe('pullRequests.repo'))

    this.subscribe('updates.last', {api: 'GitHub', callType: 'repos'});
    this.subscribe('updates.last', {api: 'GitHub', callType: 'issues'});
    this.subscribe('updates.last', {api: 'GitHub', callType: 'pullrequests'});

    this.lastUpdate = new ReactiveVar(new Date().getTime());
})

Template.repos.onRendered(function() {
    this.autorun(() => {
        // We update the last updated display and disable the spinning animation
        this.lastUpdate.set(Math.min(...Updates.find().map(a => a.timestamp)));
        Template.instance().$('.refreshButton').removeClass('refreshing');
    });
});

Template.repos.helpers({
    githubRepos: () => Repos.find({}),
    issueCount: (repoId) => Issues.find({repoId}).count(),
    prCount: (repoId) => PullRequests.find({repoId}).count(),

    lastUpdated: () => Template.instance().lastUpdate.get(),
})

Template.repos.events({
    'click .refreshButton': (ev, tpl) => {
        tpl.$('.refreshButton').addClass('refreshing');

        Meteor.call('updateGithubRepos', {});
        Meteor.call('updateGithubIssues');
        Meteor.call('updateGithubPullRequests');
    }
})