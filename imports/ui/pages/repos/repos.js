import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { getGithubRepos } from '/imports/api/repos/methods.js'

import './repos.html'


Template.repos.onCreated(async function reposCreated() {
    this.activeRepos = new ReactiveVar([]);

    this.activeRepos.set(await getGithubRepos());

});

Template.repos.helpers({
    //get getGithubRepos into helper for each statement but its not working ¯\_(ツ)_/¯
    githubRepos: () => {
        let activeRepos = Template.instance().activeRepos.get()
        return activeRepos;
    },

});