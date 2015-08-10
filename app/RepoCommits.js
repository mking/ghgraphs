import './RepoCommits.scss';
import classNames from 'classnames';
import ContributorCommits from './ContributorCommits';
import moment from 'moment';
import React from 'react';

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

  render() {
    const {className, contributors, ...props} = this.props;
    const earliestWeekDate = RepoCommits.getEarliestWeekDate(contributors);
    const maxCommits = RepoCommits.getMaxCommits(contributors);
    return <div
      className={classNames('repoCommits', className)}
      {...props}>
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
    </div>;
  }
}

export default RepoCommits;
