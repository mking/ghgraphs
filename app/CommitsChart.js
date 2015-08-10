import './CommitsChart.scss';
import _ from 'lodash';
import classNames from 'classnames';
import d3 from 'd3';
import moment from 'moment';
import React from 'react';

class CommitsChart extends React.Component {
  static defaultProps = {
    height: 130,
    xAxisOffset: 40,
    commitType: 'contributor'
  };

  componentDidMount() {
    this.update();
  }

  render() {
    const {className, commitType, ...props} = this.props;
    return <svg
      className={classNames('commitsChart', commitType, className)}
      {...props}/>
  }

  update() {
    const {width, height, earliestWeekDate, maxCommits, contributor, xAxisOffset, commitsClassName, commitType} = this.props;
    const marginLeft = {
      contributor: 0,
      repo: 30
    }[commitType];
    const margin = {
      top: 0,
      right: 0,
      bottom: 0,
      left: marginLeft
    };
    const contentWidth = width - margin.left - margin.right;
    const contentHeight = height - margin.top - margin.bottom - xAxisOffset;
    const commitTypeObj = {
      contributor: {
        tickAnchor: 'middle',
        contributor: 0,
        yTicks: 2,
        tickPadding: -contentWidth / 2
      },
      repo: {
        tickAnchor: 'end',
        repo: 20,
        yTicks: 5,
        tickPadding: 10
      }
    }[commitType];

    const chart = d3.select(React.findDOMNode(this));
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
      .attr('class', 'commitsChart-axis x')
      .call(xAxis);

    const y = d3.scale.linear()
      .domain([0, maxCommits * 1.2])
      .range([contentHeight, 0]);
    const yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .tickSize(-contentWidth)
      .tickValues(_(y.ticks(commitTypeObj.yTicks)).filter(x => x !== 0).value())
      .tickPadding(commitTypeObj.tickPadding)
      .outerTickSize(0);
    const yAxisG = contentG.append('g');
    yAxisG.attr('class', 'commitsChart-axis y')
      .call(yAxis);
    yAxisG.selectAll('.tick text')
      .style('text-anchor', commitTypeObj.tickAnchor);

    const area = d3.svg.area()
      .x(d => x(d.w * 1000))
      .y0(contentHeight)
      .y1(d => y(d.c))
      .interpolate('basis');
    contentG.append('path')
      .attr('d', area(contributor.weeks))
      .attr('class', commitsClassName);
  }
}

export default CommitsChart;
