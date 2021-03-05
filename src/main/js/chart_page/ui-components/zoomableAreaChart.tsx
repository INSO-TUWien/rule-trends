import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import moment from 'moment';
import { SelectionArea } from './selectionArea';
import { colors } from '../util/helper';

interface ZoomableAreaChartProps {
  chartData: any;
  relevantRules: any;
}

interface SelectionWindow {
  left: number;
  right: number;
  bottom: number;
  top: number;
}

interface ZoomableAreaChartState {
  chartData: any;
  selectionWindow: SelectionWindow;
  startMousePositionX: number;
  startDomainValueX: number;
  selecting: boolean;
  zoomed: boolean;
}

/**
 * Component responsible for rendering diagram plus zooming-interactivity
 * @return {ZoomableAreaChart}
 */
export class ZoomableAreaChart extends React.Component<
  ZoomableAreaChartProps,
  ZoomableAreaChartState
> {
  private selectionArea: SelectionArea;
  private activeRuleKey: string;
  private readonly colors: string[];

  /**
   * Initializes ZoomableAreaChart
   * @param {Readonly<ZoomableAreaChartProps>} props
   */
  constructor(props: Readonly<ZoomableAreaChartProps>) {
    super(props);
    this.selectionArea = new SelectionArea();
    this.colors = colors;
    this.state = {
      chartData: props.chartData,
      selectionWindow: {
        left: this.props.chartData[0].date,
        right: this.props.chartData[this.props.chartData.length - 1].date,
        bottom: null,
        top: null,
      },
      startMousePositionX: 0,
      startDomainValueX: null,
      selecting: false,
      zoomed: false,
    };

    this.zoom = this.zoom.bind(this);
    this.resetZoom = this.resetZoom.bind(this);
  }

  CustomTooltip = ({ active, payload, label }: any) => {
    if (active && this.activeRuleKey != null && !this.state.selecting) {
      const numOfIssuesPerDay = payload.filter(
        (p: any) => p.dataKey === this.activeRuleKey
      )[0].value;
      const totalIssuesPerDay = payload[0].payload.total;
      const formattedDate = moment.unix(label).format('DD.MM.YYYY');
      const activeRuleName = this.props.relevantRules.filter(
        (r: any) => r.rule.key === this.activeRuleKey
      )[0].rule.name;

      return (
        <div className="ruletrends-tooltip">
          <p className="date">{formattedDate}</p>
          <p className="ruleKey">{this.activeRuleKey}</p>
          <p className="numIssues">
            {numOfIssuesPerDay} of {totalIssuesPerDay} Issues
          </p>
          <p className="ruleName">{activeRuleName}</p>
        </div>
      );
    }

    return null;
  };

  /**
   * Trigger startSelection
   * @param {any} event
   */
  onMouseDown(event: any) {
    if (event && event.chartX) {
      this.selectionArea.startSelection(event.chartX);
      this.setState({
        startDomainValueX: event.activeLabel,
        startMousePositionX: event.chartX,
        selecting: true,
      });
    }
  }

  /**
   * Trigger updateSelection
   * @param {any} event
   * @param {any} mouseMoveEvent
   */
  onMouseMove(event: any, mouseMoveEvent: any) {
    if (event && event.chartX) {
      this.selectionArea.updateSelection(
        event,
        mouseMoveEvent,
        this.state.selecting,
        this.state.startMousePositionX
      );
    }
  }

  /**
   * Trigger finishSelection
   * @param {any} event
   */
  onMouseUp(event: any) {
    this.selectionArea.finishSelection();
    if (event && event.activeLabel) {
      this.zoom(this.state.startDomainValueX, event.activeLabel);
    }
  }

  /**
   * Renders diagram and provides selection area
   * @return {React.ReactNode}
   */
  render() {
    const areas = this.props.relevantRules.map((rule: any, index: number) => {
      return (
        <Area
          type="monotone"
          key={rule.rule.key}
          dataKey={rule.rule.key}
          stackId="1"
          stroke={this.colors[index % this.colors.length]}
          fill={this.colors[index % this.colors.length]}
          onMouseEnter={() => this.onAreaEnter(rule.rule.key)}
          onMouseLeave={() => this.onAreaLeave()}
          dot={false}
          activeDot={false}
          isAnimationActive={true}
          animationDuration={1000}
        />
      );
    });

    const { selectionWindow } = this.state;

    return (
      <div>
        <button
          id="btnResetZoom"
          onClick={this.resetZoom}
          className={
            this.state.zoomed
              ? 'btn-reset-zoom-active'
              : 'btn-reset-zoom-inactive'
          }
        >
          Reset Zoom
        </button>

        <ResponsiveContainer
          id="responsiveChartContainer"
          width="100%"
          aspect={2.0}
        >
          <AreaChart
            data={this.state.chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            onMouseDown={(e) => this.onMouseDown(e)}
            onMouseMove={(e, z) => this.onMouseMove(e, z)}
            onMouseUp={(e) => this.onMouseUp(e)}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
              allowDataOverflow={true}
              interval={'preserveStartEnd'}
              scale={'linear'}
              type={'number'}
              tickFormatter={(value) => moment.unix(value).format('DD.MM.YYYY')}
              domain={[selectionWindow.left, selectionWindow.right]}
            />

            <YAxis
              type={'number'}
              scale={'linear'}
              allowDataOverflow={true}
              domain={[selectionWindow.bottom, selectionWindow.top]}
            />

            <Tooltip
              cursor={true}
              content={<this.CustomTooltip />}
              offset={20}
            />

            {areas}

            <Legend />

            <svg id="mySvg" height="100%" width="100">
              <rect
                id="myRect"
                x="0"
                y="0"
                width="100"
                height="100%"
                stroke="black"
                strokeWidth="3"
                fill="black"
              />
            </svg>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  /**
   * Performs zoom with given selection area data
   * @param {number} domainStartX
   * @param {number} domainEndX
   */
  private zoom(domainStartX: number, domainEndX: number) {
    if (domainStartX === domainEndX || domainEndX === null) {
      this.setState(() => ({ selecting: false }));
      return;
    }

    if (domainStartX > domainEndX) {
      [domainStartX, domainEndX] = [domainEndX, domainStartX];
    }

    const tmp = this.props.chartData
      .filter((i: any) => i.date >= domainStartX && i.date <= domainEndX)
      .map((i: any) => i.total);

    const yMin = 0;
    const yMax = Math.max(...tmp);

    this.setState({
      chartData: this.state.chartData.slice(),
      selectionWindow: {
        left: domainStartX,
        right: domainEndX,
        bottom: yMin,
        top: yMax,
      },
      selecting: false,
      zoomed: true,
    });
  }

  /**
   * Set active rule key when one of the areas is entered with mouse
   * @param {any} data
   */
  private onAreaEnter(data: any) {
    this.activeRuleKey = data;
  }

  /**
   * Reset active rule key when leaving the current area with mouse
   */
  private onAreaLeave() {
    this.activeRuleKey = null;
  }

  /**
   * Reset zoom
   */
  private resetZoom() {
    this.setState({
      chartData: this.state.chartData.slice(),
      selectionWindow: {
        left: null,
        right: null,
        bottom: null,
        top: null,
      },
      selecting: false,
      zoomed: false,
    });
  }
}
