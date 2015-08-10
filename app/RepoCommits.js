import './RepoCommits.scss';
import _ from 'lodash';
import classNames from 'classnames';
import ContributorCommits from './ContributorCommits';
import d3 from 'd3';
import moment from 'moment';
import Promise from 'bluebird';
import React from 'react';

const jsonAsync = Promise.promisify(d3.json);

class RepoCommits extends React.Component {
  static getEarliestWeekDate(contributors) {
    return moment(_(contributors).pluck('weeks').flatten().pluck('w').min() * 1000);
  }

  static getMaxCommits(contributors) {
    return _(contributors).pluck('weeks').flatten().pluck('c').max();
  }

  static getCommits(contributor) {
    return _(contributor.weeks).pluck('c').sum();
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
    const {className, ...props} = this.props;
    const {contributors} = this.state;
    const earliestWeekDate = RepoCommits.getEarliestWeekDate(contributors);
    const maxCommits = RepoCommits.getMaxCommits(contributors);
    return <div
      className={classNames('repoCommits', className)}
      {...props}>
      {!contributors && <div className="repoCommits-spinnerWrap">
        <img
          className="repoCommits-spinner"
          src="./img/octocat-spinner-128.gif"/>
      </div>}
      {contributors && _(contributors)
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
    </div>;
  }
}

export default RepoCommits;
