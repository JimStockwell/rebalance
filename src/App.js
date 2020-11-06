import React from 'react';
import './App.css';
import BackendApi from './BackendApi';
import { Page } from './Page';

import { withAuthenticator } from '@aws-amplify/ui-react'
import { API, Auth } from 'aws-amplify';

API.configure();

function AppBase() {
  const backendApi = BackendApi.create();

  const signOut = async () => {
    await Auth.signOut()
      .then(data => {
        return this.props.onStateChange('signedOut')
      })
      .catch(err => {/*handle error*/});
    window.location.reload();
  }
  
  return (
    <div>
      <Page backend={backendApi} />
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
// https://github.com/aws-amplify/amplify-js/issues/1529 - on how to reload the withAuthenticator(AppBase) after log-out

const App = withAuthenticator(AppBase);

export { App as default, AppBase };
