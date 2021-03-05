import moment from 'moment';
import { Rule } from '../models/rule';
import { Issue } from '../models/issue';
import { DiagramData } from '../models/diagramData';
import { RuleService } from './ruleService';
import { IssuesPerDay } from '../models/issuesPerDay';
import { IssueService } from './issueService';
import { ChangeLogEntry } from '../models/changeLogEntry';
import { IssueChangeLog } from '../models/issueChangeLog';
import { ChangeLogService } from './changeLogService';
import { customLog } from '../util/helper';

/**
 * Main service responsible for fetching all data needed for RuleTrends
 */
export class RuleTrendsService {
  private loadingProgress: number = 0;
  private isFetchingActive: boolean = false;
  private issueService: IssueService;
  private ruleService: RuleService;
  private changeLogService: ChangeLogService;

  /**
   * Initializes RuleTrendsService by reading project key and organization key
   * out of local storage of SonarQube frontend
   */
  constructor() {
    const projectKey = RuleTrendsService.getMostRecentProjectFromLocalStorage()
      .key;
    const organizationKey = RuleTrendsService.getMostRecentProjectFromLocalStorage()
      .organization;

    this.issueService = new IssueService(projectKey);
    this.ruleService = new RuleService(organizationKey);
    this.changeLogService = new ChangeLogService();
  }

  /**
   * Helper method for reading local storage
   * @return {any} - SonarQube frontend local storage
   */
  private static getMostRecentProjectFromLocalStorage(): any {
    const item = localStorage.getItem('sonar_recent_history');
    return item != null && item.length > 0
      ? JSON.parse(item)[0]
      : {
          key: 'test',
          organization: 'default-organization',
        };
  }

  /**
   * Get start date from local storage.
   * It is settable via local storage in order to allow testing with fixed dates
   * @return {Moment}
   */
  private static getStartDate() {
    const predefinedStartDate = localStorage.getItem('rule_trends_start_date');
    if (predefinedStartDate != null) {
      return moment.unix(+predefinedStartDate);
    }
    return moment().endOf('day');
  }

  /**
   * Helper method for incrementing progress counter and invoking
   * callback notify method
   * @param {function} notifyProgressUpdate
   */
  incrementProgressAndNotify(notifyProgressUpdate: (progress: number) => void) {
    this.loadingProgress++;
    notifyProgressUpdate(this.loadingProgress);
  }

  /**
   * Reset loading counter and fetching
   */
  reset() {
    this.loadingProgress = 0;
    this.isFetchingActive = false;
  }

  /**
   * Fetches necessary diagram data by first fetching all issues.
   * Based on this data, details for all rules as well as the change-logs
   * for required issues are fetched.
   * Finally, the data is transformed into an issue-per-day format
   * @param {number} noDays
   * @param {function} notifyProgressUpdate
   * @param {function} onFinished
   */
  fetchDiagramData(
    noDays = 300,
    notifyProgressUpdate: (progress: number) => void,
    onFinished: (data: DiagramData) => void
  ) {
    this.isFetchingActive = true;

    const promiseIssues = this.issueService.fetchIssues(() =>
      this.incrementProgressAndNotify(notifyProgressUpdate)
    );

    promiseIssues.then((issues: Issue[]) => {
      const uniqueRuleKeys = [
        ...new Set(issues.map((issue: Issue) => issue.rule)),
      ] as string[];
      const uniqueIssueKeysToFetchChangeLog = issues
        .filter((issue: Issue) => issue.status !== 'OPEN')
        .map((issue: Issue) => issue.key);

      const promisesRules = uniqueRuleKeys.map((r: string) =>
        this.ruleService.fetchRule(r, () =>
          this.incrementProgressAndNotify(notifyProgressUpdate)
        )
      );

      const promiseAllRules: Promise<Rule[]> = Promise.all(promisesRules);

      const promisesIssueChangeLogs = uniqueIssueKeysToFetchChangeLog.map(
        (i: string) =>
          this.changeLogService.fetchIssueChangeLog(i, () =>
            this.incrementProgressAndNotify(notifyProgressUpdate)
          )
      );

      const promiseAllIssueChangeLogs: Promise<IssueChangeLog[]> = Promise.all(
        promisesIssueChangeLogs
      );

      Promise.all([promiseAllRules, promiseAllIssueChangeLogs]).then(
        (data: [Rule[], IssueChangeLog[]]) => {
          const rules: Rule[] = data[0];
          const issueChangeLogs: IssueChangeLog[] = data[1];

          customLog('issueChangeLogs', issueChangeLogs);

          const diagramData: DiagramData = this.prepareDiagramData(
            noDays,
            issues,
            rules,
            issueChangeLogs
          );

          onFinished(diagramData);
          this.reset();
        }
      );
    });
  }

  /**
   * Prepare diagram data based on fetched data
   * @param {number} noDays
   * @param {Issue[]} issues
   * @param {Rule[]} rules
   * @param {IssueChangeLog[]} issueChangeLogs
   * @return {DiagramData}
   */
  private prepareDiagramData(
    noDays: number,
    issues: Issue[],
    rules: Rule[],
    issueChangeLogs: IssueChangeLog[]
  ): DiagramData {
    const startDate = RuleTrendsService.getStartDate();

    const dates = Array<number>(noDays)
      .fill(0)
      .map((item: number, index: number) => index)
      .reverse()
      .map((index: number) => startDate.clone().subtract(index, 'days').unix());

    const issueChangeLogDictionary: { [key: string]: ChangeLogEntry[] } = {};
    issueChangeLogs.forEach(
      (issueChangeLog) =>
        (issueChangeLogDictionary[issueChangeLog.issueKey] =
          issueChangeLog.changeLogEntries)
    );

    const issuesPerDay: IssuesPerDay[] = dates.map((date) => {
      return {
        date: date,
        issues: issues
          .filter((issue) => issue.creationDate <= date)
          .filter(
            (issue) =>
              issue.status === 'OPEN' ||
              !(
                '' +
                this.changeLogService.getLatestStateBefore(
                  issueChangeLogDictionary[issue.key],
                  date
                )
              ).match(/(CLOSED|RESOLVED)/g)
          ),
      };
    });

    return { issues: issuesPerDay, rules: rules } as DiagramData;
  }
}
