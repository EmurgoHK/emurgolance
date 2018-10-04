import { Meteor } from 'meteor/meteor'
import { HTTP } from 'meteor/http'
import { Promise } from 'meteor/promise'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { Tokens } from '../tokens/tokens'
import { Repos } from './repos'

const token = (Tokens.findOne({
    _id: 'github-api-token'
}) || {}).token || ''

export const updateGithubRepos = new ValidatedMethod({
    name: 'updateGithubRepos',
    validate: null,
    run({}) {
        let providerUrl = `https://api.github.com/orgs/EmurgoHK/repos${token ? `?access_token=${token}` : ''}`
    
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
                    reject(err)
                }
            })
        }).then(function(result) {
             result.forEach(i => {
                let repoUrl = `https://api.github.com/repos/EmurgoHK/${i.name}/issues?sort=created&state=open${token ? `&access_token=${token}` : ''}`
                
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
                        issueCount: repoData.data.filter(i => !i.pull_request).length,
                        pullCount: repoData.data.filter(i => !!i.pull_request).length
                    })
                }
            })

            if (repoArray && repoArray.length) {
                Repos.remove({})
                repoArray.forEach(i => Repos.insert(i))
            }
        })
    }
})