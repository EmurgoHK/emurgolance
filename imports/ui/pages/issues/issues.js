import { notify } from "/imports/modules/notifier"
import moment from "moment"

import './issues.html'

import { getIssuesOfRepositories } from '/imports/api/repositories/methods'

Template.issues.onCreated(function() {
    
    const instance = this
    instance.issues = new ReactiveVar([])

    let allIssues = []
    new Promise((resolve, reject) => {
        getIssuesOfRepositories.call({ }, (data) => {
            instance.issues.set(data);
        }) 
    })
});

Template.issues.helpers({
    issues() {
        let unlabelledIssues = Template.instance().issues.get().filter(issue => {

            let labels = issue.labels.map((label, i, a) => label.name)
            
            if (!labels.includes('done') && !labels.includes('Done') && !labels.includes('in progress') && !labels.includes('In progress') )  return issue;
        
        }).filter(issue => !issue.html_url.includes('pull')).sort((issue, nextIssue) => moment(nextIssue.created_at) - moment(issue.created_at));

        return unlabelledIssues
    },
    removeHostname: (url) => {
        return url.replace(/http(s|):\/\/github.com\/(blockrazor|emurgohk)\//i, '')
    },
    projectName: (url) => {
        return url.split('/')[4]
    }
});
