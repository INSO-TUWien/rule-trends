import { customLog } from '../util/helper';
import { Issue } from '../models/issue';
import moment from 'moment';

/**
 * Service component responsible for fetching issue data
 */
export class IssueService {
  private issueCachePromise: any;
  private issueCache: Issue[];
  private api: string;

  /**
   * Initializes IssueService
   * @param {string} projectKey - SonarQube project key
   * @param {string} baseAddress (optional)
   */
  constructor(projectKey: string, baseAddress: string = '') {
    this.api = baseAddress + '/api/issues/search?componentKeys=' + projectKey;
  }

  /**
   * Method for fetching paged issue data
   * @param {number} localPageIndex
   * @param {Issue[]} localIssueCache
   * @param {function} notifyProgressUpdate
   * @return {Promise<Issue[]>}
   */
  fetchPagedIssues(
    localPageIndex: number,
    localIssueCache: Issue[],
    notifyProgressUpdate: () => void
  ): any {
    return fetch(this.api + '&p=' + localPageIndex)
      .then((res) => res.json())
      .then((json) => {
        notifyProgressUpdate();
        localIssueCache = localIssueCache.concat(
          json.issues.map((issue: any) => {
            return {
              key: issue.key,
              status: issue.status,
              rule: issue.rule,
              creationDate: moment(issue.creationDate).unix(),
            };
          })
        );

        if (json.issues.length <= 0) {
          // stop fetching
          customLog(localIssueCache);
          this.issueCache = localIssueCache;
          customLog('Finished. Total issues: ' + localIssueCache.length);
          return this.issueCache;
        } else {
          return this.fetchPagedIssues(
            localPageIndex + 1,
            localIssueCache,
            notifyProgressUpdate
          );
        }
      });
  }

  /**
   * Main method for fetching issue data
   * @param {function} notifyProgressUpdate
   * @return {Promise<Issue[]>}
   */
  fetchIssues(notifyProgressUpdate: () => void) {
    if (this.issueCachePromise == null) {
      this.issueCachePromise = this.fetchPagedIssues(
        1,
        [],
        notifyProgressUpdate
      );
    }

    return this.issueCachePromise;
  }
}
