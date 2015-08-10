import './app.scss';
import _ from 'lodash';
import d3 from 'd3';
import moment from 'moment';
import Promise from 'bluebird';

const jsonAsync = Promise.promisify(d3.json);

jsonAsync('./json/contributors.json').then(contributors => {
  console.log(contributors);
  update(contributors);
});

function update(contributors) {
  const width = 450;
  const height = 130;
  const margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
  };
  const xAxisOffset = 40;
  const contentWidth = width - margin.left - margin.right;
  const contentHeight = height - margin.top - margin.bottom - xAxisOffset;
  const contributor = _(contributors).find(contributor => contributor.author.login === 'joelburget');
  const earliestWeekDate = moment(_(contributors).map(contributor => contributor.weeks).flatten().pluck('w').min() * 1000);
  const maxCommits = _(contributors).map(contributor => contributor.weeks).flatten().pluck('c').max();

  const chart = d3.select('#chart');
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
