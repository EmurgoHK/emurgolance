import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Repos } from '/imports/api/repos/repos'

import './repos.html'
import { Issues } from '../../../api/issues/issues';
import { PullRequests } from '../../../api/pullRequests/pullRequests';

Template.repos.onCreated(function reposCreated() {
    this.activeRepos = new ReactiveVar([])

    this.autorun(() => this.subscribe('repos'))
    this.autorun(() => this.subscribe('issues.repo'))
    this.autorun(() => this.subscribe('pullRequests.repo'))
})

Template.repos.helpers({
    githubRepos: () => Repos.find({}),
    issueCount: (repoId) => Issues.find({repoId}).count(),
    prCount: (repoId) => PullRequests.find({repoId}).count(),
})