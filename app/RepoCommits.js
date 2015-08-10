import './RepoCommits.scss';
import _ from 'lodash';
import classNames from 'classnames';
import ContributorCommits from './ContributorCommits';
import CommitsChart from './CommitsChart';
import d3 from 'd3';
import moment from 'moment';
import Promise from 'bluebird';
import React from 'react';

const jsonAsync = Promise.promisify(d3.json);

class RepoCommits extends React.Component {
  static defaultProps = {
    width: 940,
    chartHeight: 145,
    dateFormat: date => date.format('MMM D, YYYY')
  };

  static getCommits(contributor) {
    return _(contributor.weeks).pluck('c').sum();
  }

  static getEarliestWeekDate(contributors) {
    return moment(_(contributors).pluck('weeks').flatten().pluck('w').min() * 1000);
  }

  static getMaxCommits(contributors) {
    return _(contributors).pluck('weeks').flatten().pluck('c').max();
  }

  static getTotalContributor(contributors) {
    return {
      weeks: _(contributors)
        .pluck('weeks')
        .flatten()
        .groupBy(week => week.w)
        .mapValues((v, k) => {
          return _(['a', 'c', 'd']).map(k => {
            return [k, _(v).pluck(k).sum()];
          }).object().merge({w: parseInt(k, 10)}).value();
        })
        .values()
        .sortBy(week => week.w)
        .value()
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      contributors: null
    };
  }

  componentDidMount() {
    jsonAsync('./json/contributors.json').then(contributors => {
      this.setState({
        contributors
      });
    });
  }

  render() {
    const {className, chartHeight, width, dateFormat, ...props} = this.props;
    const {contributors} = this.state;
    const earliestWeekDate = RepoCommits.getEarliestWeekDate(contributors);
    const maxCommits = RepoCommits.getMaxCommits(contributors);
    return <div
      className={classNames('repoCommits', className)}
      style={{
        width
      }}
      {...props}>
      {!contributors && <div className="repoCommits-spinnerWrap">
        <img
          className="repoCommits-spinner"
          src="./img/octocat-spinner-128.gif"/>
      </div>}
      {contributors && <div className="repoCommits-content">
        <header className="repoCommits-header">
          <div className="repoCommits-dateRange">
            {dateFormat(earliestWeekDate)} <span dangerouslySetInnerHTML={{__html: '&ndash;'}}/> {dateFormat(moment())}
          </div>
          <div className="repoCommits-subtitle">
            Contributions to master, excluding merge commits
          </div>
        </header>
        <div className="repoCommits-chartWrap">
          <CommitsChart
            className="repoCommits-chart"
            commitsClassName="repoCommits-commits"
            commitType="repo"
            contributor={RepoCommits.getTotalContributor(contributors)}
            earliestWeekDate={earliestWeekDate}
            height={chartHeight}
            margin={{
              top: 0,
              right: 0,
              bottom: 0,
              left: 20
            }}
            maxCommits={maxCommits}
            width={width - 60}
            xAxisOffset={20}/>
        </div>
        <div className="repoCommits-contributors">
          {_(contributors)
            .sortBy(contributor => -RepoCommits.getCommits(contributor))
            .map((contributor, i) => {
              const rank = i + 1;
              return <ContributorCommits
                key={i}
                className="repoCommits-contributor"
                contributor={contributor}
                earliestWeekDate={earliestWeekDate}
                maxCommits={maxCommits}
                rank={rank}/>;
            }).value()}
        </div>
      </div>}
    </div>;
  }
}

export default RepoCommits;
