import './app.scss';
import Promise from 'bluebird';
import React from 'react';
import RepoCommits from './RepoCommits';

const jsonAsync = Promise.promisify(d3.json);

jsonAsync('./json/contributors.json').then(contributors => {
  console.log(contributors);

  React.render(
    <RepoCommits
      contributors={contributors}/>,
    document.getElementById('content')
  );
});
