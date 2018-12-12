import { Meteor } from "meteor/meteor";

import { Tokens } from "../tokens/tokens";
import { Repos } from "../repos/repos";
import { Issues } from "./issues";

import { buildApiUrl } from "../utilities";

const token =
  (
    Tokens.findOne({
      _id: "github-api-token"
    }) || {}
  ).token || "";

export const updateGithubIssues = new ValidatedMethod({
  name: "updateGithubIssues",
  validate: null,
  run() {
    if (Meteor.isServer) {

      for (const repo of Repos.find({})) {
        const url = buildApiUrl(repo.issuesUrl, token, undefined, [['sort', 'created'], ['per_page', '100']]);
        HTTP.get(url,
          {
            headers: {
              "User-Agent": "EmurgoBot"
            }
          },
          (err, resp) => {
            if (err) throw err;
            for (const issue of resp.data) {
              Issues.upsert({_id: issue.id}, {
                _id: issue.id,
                repoId: repo._id,

                url: issue.html_url,
                number: issue.number,
                title: issue.title,

                creator: issue.user.login,
                creatorUrl: issue.user.html_url,
                assignee: issue.assignee && issue.assignee.login,

                body: issue.body,

                state: issue.state,
                createdAt: issue.created_at,
                updatedAt: issue.updated_at,
                closedAt: issue.closed_at,

                commentCount: issue.comments,
                commentUrl: issue.comments_url,

                labels: issue.labels.map(l => l.name),
              })
            }
          }
        );
      }
    }
  }
});
