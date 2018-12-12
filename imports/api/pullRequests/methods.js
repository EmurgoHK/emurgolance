import { Meteor } from "meteor/meteor";
import { Promise } from "meteor/promise";

import { Tokens } from "../tokens/tokens";
import { Repos } from "../repos/repos";
import { PullRequests } from "./pullRequests";

import { buildApiUrl } from "../utilities";

const token =
  (
    Tokens.findOne({
      _id: "github-api-token"
    }) || {}
  ).token || "";

export const updateGithubPullRequests = new ValidatedMethod({
  name: "updateGithubPullRequests",
  validate: null,
  run() {
    if (Meteor.isServer) {
      for (const repo of Repos.find({})) {
        const url = buildApiUrl(repo.pullsUrl, token, undefined, [['sort', 'created'], ['per_page', '100']]);
        HTTP.get(url,
          {
            headers: {
              "User-Agent": "EmurgoBot"
            }
          },
          (err, resp) => {
            if (err) throw err;
            for (const pr of resp.data) {
              PullRequests.upsert({_id: resp.data.id}, {
                _id: resp.data.id,
                repoId: repo._id,

                url: pr.url,
                number: pr.number,
                title: pr.title,

                assignee: pr.assignee && pr.assignee.login,

                body: pr.body,

                state: pr.state,
                createdAt: pr.createdAt,
                updatedAt: pr.updatedAt,
                closedAt: pr.closedAt,

                commentCount: pr.comments,
                commentUrl: pr.comments_url,

                labels: pr.labels.map(l => l.name),
              })
            }
          }
        );
      }
    }
  }
});
