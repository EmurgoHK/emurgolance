import { Updates } from "./updates";

/**
 * Logs the fact of an update happening in the Updates collection.
 * @param {string} api Type of the API used (e.g. "GitHub")
 * @param {string} callType Type of the update (e.g. "repos")
 */
export function logUpdate(api, callType) {
  Updates.insert({ api, callType, timestamp: new Date().getTime() });
}

/**
 * Returns if the caller should/could update on the passed api
 * @param {string} api
 * @param {string} callType
 */
export function shouldUpdate(api, callType) {
  return !Updates.findOne({
    api,
    callType,
    timestamp: { $gt: new Date().getTime() - 10000 }
  });
}
