import { Meteor } from 'meteor/meteor'
import { Promise } from 'meteor/promise';

export const getIssuesOfRepositories = (callback)  => {
    let user = "EmurgoHK"

    var orgUrl = `https://api.github.com/orgs/${user}/repos?per_page=100`
	var repoUrl = `https://api.github.com/repos/${user}/`
    
    var issuesEndPoint = "/issues?sort=created&state=open&per_page=100"

    let repositories = []

    let allIssues = []

	return new Promise((resolve, reject) => {
		HTTP.get(orgUrl, { headers: {
              'User-Agent': 'EmurgoBot'
    	}}, (err, data) => {
            repositories = data.data
			resolve(data)
		})
    })
    .then((data) => {
        let allPromises = []
        repositories.forEach(repo => {
            let promise = new Promise((resolve, reject) => {
                let url = `${repoUrl}${repo.name}${issuesEndPoint}`;
                HTTP.get(url, { headers: {
                    'User-Agent': 'EmurgoBot'
                }}, (err, data) => {
                    allIssues = allIssues.concat(data.data)
                    resolve(allIssues)
                })
            })
            allPromises.push(promise)
        })

        Promise.all(allPromises).then(values => {
            callback(allIssues)
        })
    })
}
