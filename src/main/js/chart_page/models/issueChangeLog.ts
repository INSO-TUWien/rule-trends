import { ChangeLogEntry } from './changeLogEntry';

/**
 * Model class for storing IssueChangeLog data
 */
export class IssueChangeLog {
  issueKey: string;
  changeLogEntries: ChangeLogEntry[];
}
