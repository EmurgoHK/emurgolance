import { Meteor } from 'meteor/meteor'
import { HTTP } from 'meteor/http'
import { Promise } from 'meteor/promise';
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'

import { isModerator } from '/imports/api/users/methods'

export const getGithubRepos = () => {
    let providerUrl = `https://api.github.com/orgs/EmurgoHK/repos?access_token=${process.env.GITHUB_API_TOKEN}`
    
    let repoArray = []
    
    return new Promise(function(resolve, reject) {
        HTTP.get(providerUrl, {
            headers: {
                'User-Agent': 'emurgo/bot'
            }
        }, (err, data) => {
            if (!err && data.statusCode === 200) {
                 resolve(data.data)
            } else {
                console.error(err)
            }
        })
    }).then(function(result) {
         result.forEach(i => {
            let repoUrl = `https://api.github.com/repos/EmurgoHK/${i.name}/pulls?access_token=${process.env.GITHUB_API_TOKEN}`
            
            let repoData = {}
            try {
                repoData = HTTP.get(repoUrl, {
                    headers: {
                        'User-Agent': 'emurgo/bot'
                    }
                })
            } catch(e) {}

            if (repoData && repoData.statusCode === 200) {
                repoArray.push({
                    repo: i.name,
                    pullCount: repoData.data.length
                })
            }
        })

        return repoArray
    })
} 