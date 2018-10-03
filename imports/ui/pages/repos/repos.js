import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { getGithubRepos } from '/imports/api/repos/methods.js'

import './repos.html'


Template.repos.onCreated(async function reposCreated() {
    this.activeRepos = new ReactiveVar([])

    getGithubRepos.call({}, async (err, data) => this.activeRepos.set(data))
})

Template.repos.helpers({
    githubRepos: () => Template.instance().activeRepos.get()
})