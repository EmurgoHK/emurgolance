import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { Promise } from "meteor/promise";
import { ValidatedMethod } from "meteor/mdg:validated-method";

import { Tokens } from "../tokens/tokens";
import { Repos } from "./repos";

const token =
  (
    Tokens.findOne({
      _id: "github-api-token"
    }) || {}
  ).token || "";

export const updateGithubRepos = new ValidatedMethod({
  name: "updateGithubRepos",
  validate: null,
  run({}) {
    let providerUrl = `https://api.github.com/orgs/EmurgoHK/repos${
      token ? `?access_token=${token}` : ""
    }`;

    Repos.remove({});

    return new Promise(function(resolve, reject) {
      HTTP.get(
        providerUrl,
        {
          headers: {
            "User-Agent": "emurgo/bot"
          }
        },
        (err, resp) => {
          if (resp && resp.statusCode === 200) {
            for (const repo of resp.data) {
              Repos.upsert({
                _id: repo.id,
              }, {
                _id: repo.id,
                name: repo.name,
                url: repo.html_url,
                issuesUrl: repo.issues_url,
                pullsUrl: repo.pulls_url,
              });
            }
            resolve();
          } else {
            reject(err);
          }
        }
      );
    });
  }
});
