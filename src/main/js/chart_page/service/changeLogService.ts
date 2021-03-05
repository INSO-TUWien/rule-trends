import moment from 'moment';
import { StatusDiff } from '../models/statusDiff';
import { ChangeLogEntry } from '../models/changeLogEntry';
import { IssueChangeLog } from '../models/issueChangeLog';

/**
 * Service class responsible for fetching changeLog data
 */
export class ChangeLogService {
  private changeLogEntryPromises: {
    [key: string]: Promise<IssueChangeLog>;
  } = {};
  private api: string;

  /**
   * ChangeLogService constructor
   * @param {string} baseAddress
   */
  constructor(baseAddress: string = '') {
    this.api = baseAddress + '/api/issues/changelog';
  }

  /**
   * Main method responsible for fetching changeLogData
   * @param {string} issueKey
   * @param {function} notifyProgressUpdate
   * @return {Promise<IssueChangeLog>} promise of issueChangeLog
   */
  fetchIssueChangeLog(issueKey: string, notifyProgressUpdate: () => void) {
    if (!this.changeLogEntryPromises[issueKey]) {
      this.changeLogEntryPromises[issueKey] = fetch(
        this.api + '?issue=' + issueKey
      )
        .then((res) => res.json())
        .then((data) => {
          notifyProgressUpdate();
          return {
            issueKey: issueKey,
            changeLogEntries: data.changelog.map((entry: any) => {
              return {
                creationDate: moment(entry.creationDate).unix(),
                diffs: entry.diffs
                  .filter((diff: any) => diff.key === 'status')
                  .map((diff: any) => {
                    return { key: diff.key, newValue: diff.newValue };
                  }) as StatusDiff[],
              } as ChangeLogEntry;
            }),
          } as IssueChangeLog;
        });
    }

    return this.changeLogEntryPromises[issueKey];
  }

  /**
   * Returns latest status of given changeLogEntry
   * @param {ChangeLogEntry} changeLogEntry
   * @return {string} status
   */
  getStatus(changeLogEntry: ChangeLogEntry): string {
    return changeLogEntry.diffs.filter((d) => d.key === 'status')[0].newValue;
  }

  /**
   * Returns latest state of an issue before a given date
   * @param {ChangeLogEntry[]} changeLogEntries
   * @param {moment.MomentInput} dayX
   * @return {string} state
   */
  getLatestStateBefore(
    changeLogEntries: ChangeLogEntry[],
    dayX: moment.MomentInput
  ): string {
    // array is sorted for date ascending,
    // i.e. changeLogEntries[0] is oldest, changeLogEntries[n] is newest
    const timelyRelevantEntries = changeLogEntries.filter((entry) =>
      moment(entry.creationDate).isBefore(dayX)
    );

    if (timelyRelevantEntries.length > 0) {
      return this.getStatus(
        timelyRelevantEntries[timelyRelevantEntries.length - 1]
      );
    }

    return null;
  }
}
