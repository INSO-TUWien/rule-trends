import React from 'react';
import { Rule } from '../models/rule';
import { DiagramData } from '../models/diagramData';
import { IssuesPerDay } from '../models/issuesPerDay';
import { FilterComponent } from './filterComponent';
import { DiagramComponent } from './diagramComponent';
import { RuleTrendsService } from '../service/ruleTrendsService';
import { customLog } from '../util/helper';

interface RuleTrendsComponentProps {
  days: number;
  issueData?: IssuesPerDay[];
  ruleData?: Rule[];
}

interface RuleTrendsComponentState {
  rules: Rule[];
  issues: IssuesPerDay[];
  filteredRuleKeys: string[];
  isFetchingActive: boolean;
  loadingProgress: number;
}

/**
 * Entry component for RuleTrends.
 * Responsible for managing interaction between
 * api fetching (service) and diagram (ui)
 */
export class RuleTrendsComponent extends React.Component<
  RuleTrendsComponentProps,
  RuleTrendsComponentState
> {
  private ruleTrendsService: RuleTrendsService;

  static defaultProps = {
    days: 365,
    issueData: [] as IssuesPerDay[],
    ruleData: [] as Rule[],
  };

  /**
   * Initializes RuleTrendsComponent
   * @param {Readonly<RuleTrendsComponentProps>} props
   */
  constructor(props: Readonly<RuleTrendsComponentProps>) {
    super(props);
    this.ruleTrendsService = new RuleTrendsService();
    this.state = {
      issues: [],
      filteredRuleKeys: null,
      rules: [],
      isFetchingActive: false,
      loadingProgress: 0,
    };

    this.onFilterChanged = this.onFilterChanged.bind(this);
  }

  /**
   * Depending on the given props, sets initial state or
   * triggers diagram data fetching
   */
  componentDidMount() {
    if (!this.isPropsDataEmpty()) {
      this.setState({
        isFetchingActive: false,
        issues: this.props.issueData,
        rules: this.props.ruleData,
      });
    } else {
      this.ruleTrendsService.fetchDiagramData(
        this.props.days,
        (progress) => {
          this.setState({ isFetchingActive: true, loadingProgress: progress });
        },
        (data: DiagramData) => {
          customLog('diagramData', data);
          this.setState({
            isFetchingActive: false,
            issues: data.issues,
            rules: data.rules,
          });
        }
      );
    }
  }

  /**
   * Determines if the supplied props data already contains diagram data
   * @return {boolean} - whether props is empty
   */
  private isPropsDataEmpty(): boolean {
    return (
      (this.props.issueData == null || this.props.issueData.length == 0) &&
      (this.props.ruleData == null || this.props.ruleData.length == 0)
    );
  }

  /**
   * Method that is triggered when filter was changed
   * @param {string[]} selectedRuleKeys - contains selected rule keys
   */
  onFilterChanged(selectedRuleKeys: string[]) {
    this.setState({
      filteredRuleKeys: selectedRuleKeys,
    });
  }

  /**
   * Displays loading screen during fetching and renders diagram
   * once data is complete
   * @return {React.ReactNode} react component
   */
  render() {
    if (
      this.state.isFetchingActive ||
      this.state.rules == null ||
      this.state.rules.length <= 0
    ) {
      return (
        <div className="wrapper">
          <div className="loadingBar">loading {this.state.loadingProgress}</div>
        </div>
      );
    }

    customLog('chart data rules:', this.state.rules);
    customLog('chart data issues:', this.state.issues);

    return (
      <div id="ruleTrendsComponent" className="wrapper">
        <div className="chart">
          <h1>RuleTrends</h1>
          <p>
            This diagram shows open issues on a per-day basis, grouped by their
            rule. Drag to zoom.
          </p>

          <FilterComponent
            rules={this.state.rules}
            onRuleSelectChange={this.onFilterChanged}
          />

          <DiagramComponent
            rules={this.state.rules}
            issues={this.state.issues}
            filteredRuleKeys={this.state.filteredRuleKeys}
          />
        </div>
      </div>
    );
  }
}
