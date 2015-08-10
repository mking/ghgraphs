import './ContributorCommits.scss';
import _ from 'lodash';
import classNames from 'classnames';
import CommitsChart from './CommitsChart';
import d3 from 'd3';
import React from 'react';

class ContributorCommits extends React.Component {
  static defaultProps = {
    numberFormat: d3.format(','),
    width: 450
  };

  static getTotal(weeks) {
    return {
      commits: _(weeks).map(week => week.c).sum(),
      added: _(weeks).map(week => week.a).sum(),
      removed: _(weeks).map(week => week.d).sum()
    };
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
            <a
              className="contributorCommits-loginLink"
              href={`https://github.com/${contributor.author.login}`}>
              {contributor.author.login}
            </a>
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
        <CommitsChart
          commitsClassName="contributorCommits-commits"
          contributor={contributor}
          width={width - 20}
          {...props}/>
      </div>
    </div>;
  }
}

export default ContributorCommits;
