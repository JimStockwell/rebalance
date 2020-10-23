import React from 'react';
import './App.css';
import BackendApi from './BackendApi';
import { Page } from './Page';

import { withAuthenticator } from '@aws-amplify/ui-react'
import { API } from 'aws-amplify';

API.configure();

function AppBase() {
  const backendApi = BackendApi.create();

  return (
    <Page backend={backendApi} />
  );
}

const App = withAuthenticator(AppBase);

export { App as default, AppBase };
