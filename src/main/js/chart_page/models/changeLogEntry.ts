import { StatusDiff } from './statusDiff';

/**
 * Model class for storing ChangeLogEntry data
 */
export class ChangeLogEntry {
  creationDate: number;
  diffs: StatusDiff[];
}
