import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { Promise } from "meteor/promise";
import { ValidatedMethod } from "meteor/mdg:validated-method";

import { Tokens } from "../tokens/tokens";
import { Repos } from "./repos";
import { shouldUpdate, logUpdate } from "../updates/methods";

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
    if (!shouldUpdate("GitHub", "repos")) return;

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
            // Insert each repo into the repos collection
            for (const repo of resp.data) {
              Repos.upsert(
                {
                  _id: repo.id
                },
                {
                  _id: repo.id,
                  name: repo.name,
                  url: repo.html_url,
                  issuesUrl: repo.issues_url,
                  pullsUrl: repo.pulls_url
                }
              );
            }
            // Remove all repos that were not in the result.
            // We do not just remove all repos because other updates may be going on at the same time that rely on the Repos collection
            const repoIds = resp.data.map(a => a.id);
            Repos.remove({
              _id: { $nin: repoIds }
            });
            logUpdate("GitHub", "repos");
            resolve();
          } else {
            reject(err);
          }
        }
      );
    });
  }
});
