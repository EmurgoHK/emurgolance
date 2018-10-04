import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Repos } from '/imports/api/repos/repos'

import './repos.html'

Template.repos.onCreated(function reposCreated() {
    this.activeRepos = new ReactiveVar([])

    this.autorun(() => this.subscribe('repos'))
})

Template.repos.helpers({
    githubRepos: () => Repos.find({})
})