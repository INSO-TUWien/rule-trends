import { IssuesPerDay } from './issuesPerDay';
import { Rule } from './rule';

/**
 * Model class for storing diagram data
 */
export class DiagramData {
  issues: IssuesPerDay[];
  rules: Rule[];
}
