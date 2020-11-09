import React from 'react';
import './App.css';
import BackendApi from './BackendApi';
import { Page } from './Page';

import { withAuthenticator } from '@aws-amplify/ui-react'
import { API, Auth } from 'aws-amplify';

API.configure();

function Header() {
  return(
    <div id="header">
      <div className="top-stripe pure-g">
        <div className="pure-u-1-2"><SignOut/></div>
        <div className="pure-u-1-2">Source code is <a href="https://github.com/JimStockwell/rebalance">here</a></div>
      </div>
      <div className="pure-g pure-u-1-1"><h1 className="title">Financial Portfolio Rebalancer</h1></div>
      <div className="pure-g pure-u-1-1"><h2 className="subtitle">Bringing your portfolio back into balance</h2></div>
    </div>
  );
}

function Footer() {
  return(
    <div id="footer">
      <p>This is really just a toy project to better learn React and some AWS tech.
        I may end up taking it down at any time.
      </p>
    </div>
  )
}

function SignOut() {
  const signOut = async () => {
    await Auth.signOut()
      .then(data => {
        return this.props.onStateChange('signedOut')
      })
      .catch(err => {/*handle error*/});
    window.location.reload();
  }
  
  return(
      <button className="signout-button pure-button" onClick={signOut}>Sign Out</button>
  )
}

function AppBase() {
  const backendApi = BackendApi.create();

  return (
    <div>
      <Header/>
      <p>Welcome to Financial Portfolio Rebalancer.
      </p><p>
        I had a problem.
        I wanted my savings portfolio to hold certain percentages of various index funds,
        but as prices changed,
        my actual percentages deviated away from my target percentages.
        Periodically correcting this resulted in more calculator (or spreadsheet) work than I wanted.
      </p><p>
        This portfolio rebalancer is my solution.
        It looks up prices (using finnhub.io)
        and calculates how much of a given index needs to be bought or sold
        to bring the portfolio back to the targeted balance.
      </p><p>
        <ul>
          <li>Target % is the percent of the portfolio desired for this asset.</li>
          <li>Buy is the amout to buy (or sell if negative),
            to bring the portfolio back to the target percentages.
          </li>
        </ul>
      </p>

      <Page backend={backendApi} />
      <Footer/>
    </div>
  );
}
// https://github.com/aws-amplify/amplify-js/issues/1529 - on how to reload the withAuthenticator(AppBase) after log-out

const App = withAuthenticator(AppBase);

export { App as default, AppBase };
