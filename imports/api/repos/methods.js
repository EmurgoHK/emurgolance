import { Meteor } from 'meteor/meteor'
import { HTTP } from 'meteor/http'
import { Promise } from 'meteor/promise';
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'

import { isModerator } from '/imports/api/users/methods'


export const getGithubRepos = () => {
    let providerUrl = `https://api.github.com/orgs/EmurgoHK/repos?access_token=efd6bd79dead661f63d772f863392dd153e91e1f`
    repoArray = []

    return new Promise(function(resolve, reject) {

        HTTP.get(providerUrl, (err, data) => {
            if (!err && data.statusCode === 200) {

                resolve(data.data)

            } else {
                console.error(err)
            }
        })

    }).then(function(result) {


        result.forEach(i => {

            let repoUrl = `https://api.github.com/repos/EmurgoHK/${i.name}/pulls?access_token=efd6bd79dead661f63d772f863392dd153e91e1f`
            HTTP.get(repoUrl, (err, repoData) => {
                if (!err && repoData.statusCode === 200) {

                    repoArray.push({ 'repo': i.name, pullCount: repoData.data.length })

                } else {
                    console.error(err)
                }
            })

        })

        return repoArray;

    });

}