import React from 'react';
import { Rule } from '../models/rule';
import { Issue } from '../models/issue';
import { IssuesPerDay } from '../models/issuesPerDay';
import { ZoomableAreaChart } from './zoomableAreaChart';
import { customLog } from '../util/helper';

type DiagramComponentProps = {
  rules: Rule[];
  filteredRuleKeys: string[];
  issues: IssuesPerDay[];
};

/**
 * Component responsible for preparing data suitable
 * for charts library (Recharts)
 */
export class DiagramComponent extends React.Component<
  DiagramComponentProps,
  any
> {
  /**
   * Initializes DiagramComponent
   * @param {Readonly<DiagramComponentProps>} props
   */
  constructor(props: Readonly<DiagramComponentProps>) {
    super(props);
  }

  /**
   * Helper method for calculating absolute difference sum
   * of a number array
   * @param {number[]} arr
   * @return {number} absolute difference sum
   */
  private getAbsoluteDifferenceSum(arr: number[]): number {
    return arr
      .slice(1)
      .map((value, index) => Math.abs(value - arr[index]))
      .reduce((accumulator, currentValue) => accumulator + currentValue);
  }

  /**
   * Prepares data suitable for Recharts library
   * @return {React.ReactNode}
   */
  render() {
    const relevantRules = this.props.rules
      .filter(
        (rule) =>
          this.props.filteredRuleKeys == null ||
          this.props.filteredRuleKeys.length == 0 ||
          this.props.filteredRuleKeys.filter((fr) => fr === rule.key).length > 0
      )
      .map((rule) => {
        const numOfIssuesPerDay = this.props.issues.map(
          (entry) =>
            entry.issues.filter((issue: Issue) => issue.rule === rule.key)
              .length
        );

        return {
          rule: rule,
          diff: this.getAbsoluteDifferenceSum(numOfIssuesPerDay),
        };
      });

    relevantRules.sort((a, b) => a.diff - b.diff);

    const reChartsData = this.props.issues.map((perDayIssues) => {
      const r: any = {
        date: perDayIssues.date,
        total: perDayIssues.issues.length,
      };

      relevantRules.forEach((rule) => {
        r[rule.rule.key] = perDayIssues.issues.filter(
          (issue) => issue.rule === rule.rule.key
        ).length;
      });

      return r;
    });

    customLog('reChartsRuleData: ', reChartsData);
    return (
      <div id="chart">
        <ZoomableAreaChart
          chartData={reChartsData}
          relevantRules={relevantRules}
        />
      </div>
    );
  }
}
