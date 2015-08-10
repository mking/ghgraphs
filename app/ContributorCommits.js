import './ContributorCommits.scss';
import _ from 'lodash';
import classNames from 'classnames';
import d3 from 'd3';
import moment from 'moment';
import React from 'react';

class ContributorCommits extends React.Component {
  static defaultProps = {
    numberFormat: d3.format(','),
    width: 450,
    chartHeight: 130,
    margin: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    }
  };

  static getTotal(weeks) {
    return {
      commits: _(weeks).map(week => week.c).sum(),
      added: _(weeks).map(week => week.a).sum(),
      removed: _(weeks).map(week => week.d).sum()
    };
  }

  componentDidMount() {
    this.update();
  }

  render() {
    const {className, contributor, numberFormat, rank, width, ...props} = this.props;
    const total = ContributorCommits.getTotal(contributor.weeks);
    return <div
      className={classNames('contributorCommits', className)}
      style={{
        width
      }}
      {...props}>
      <header className="contributorCommits-header">
        <img
          className="contributorCommits-avatar"
          src={contributor.author.avatar}/>
        <div className="contributorCommits-headerText">
          <div className="contributorCommits-login">
            <a className="contributorCommits-loginLink" href="#">{contributor.author.login}</a>
          </div>
          <div className="contributorCommits-stats">
            <span className="contributorCommits-statsCommits">
              {numberFormat(total.commits)} commits
            </span>
            <span className="contributorCommits-divider">/</span>
            <span className="contributorCommits-statsAdded">
              {numberFormat(total.added)} ++
            </span>
            <span className="contributorCommits-divider">/</span>
            <span className="contributorCommits-statsRemoved">
              {numberFormat(total.removed)} --
            </span>
          </div>
        </div>
        <div className="contributorCommits-rank">
          #{rank}
        </div>
      </header>
      <div className="contributorCommits-body">
        <svg
          ref="chart"
          className="contributorCommits-chart"/>
      </div>
    </div>;
  }

  update() {
    const {width, margin, earliestWeekDate, maxCommits, contributor} = this.props;
    const height = this.props.chartHeight;
    const xAxisOffset = 40;
    const contentWidth = width - margin.left - margin.right;
    const contentHeight = height - margin.top - margin.bottom - xAxisOffset;

    const chart = d3.select(React.findDOMNode(this.refs.chart));
    chart.attr('width', width)
      .attr('height', height);

    const contentG = chart.append('g');
    contentG.attr('transform', `translate(${margin.left}, ${margin.top})`);

    const now = moment();
    const x = d3.time.scale()
      .domain([earliestWeekDate.toDate(), now.toDate()])
      .range([0, contentWidth]);
    const xTicks = x.ticks();
    const xAxis = d3.svg.axis()
      .scale(x)
      .tickValues(xTicks)
      .outerTickSize(0)
      .tickFormat((d, i) => {
        if (i % 2 !== 0) {
          return null;
        }
        if (i !== 0 && moment(xTicks[i - 1]).year() !== moment(d).year()) {
          // Show year instead of month if it is the first month of a new year.
          return moment(d).format('YYYY');
        }
        return moment(d).format('MMMM');
      });
    const xAxisG = contentG.append('g');
    xAxisG.attr('transform', `translate(0, ${contentHeight})`)
      .attr('class', 'axis x')
      .call(xAxis);

    const y = d3.scale.linear()
      .domain([0, maxCommits])
      .range([contentHeight, 0]);
    const yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .tickSize(-contentWidth)
      .tickValues(_(y.ticks(2)).filter(x => x !== 0).value())
      .tickPadding(-contentWidth / 2)
      .outerTickSize(0);
    const yAxisG = contentG.append('g');
    yAxisG.attr('class', 'axis y')
      .call(yAxis);
    yAxisG.selectAll('.tick text')
      .style('text-anchor', 'middle');

    const area = d3.svg.area()
      .x(d => x(d.w * 1000))
      .y0(contentHeight)
      .y1(d => y(d.c))
      .interpolate('basis');
    contentG.append('path')
      .attr('d', area(contributor.weeks))
      .attr('class', 'commits');
  }
}

export default ContributorCommits;
