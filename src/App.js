import React from 'react';
import './App.css';

import { withAuthenticator } from '@aws-amplify/ui-react'
import { API } from 'aws-amplify';

API.configure();

const UserComponent = () => {
  const [portfolioData, setPortfolioData] = React.useState("");
  const [error, setError] = React.useState("");
  React.useEffect(() => {
    let mounted = true;

    const myInit = { // OPTIONAL
      headers: {}, // OPTIONAL
      response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
    };
  
    API.get("api","/portfolio",myInit)
      .then(response => {
          console.log(response)
          if(mounted) {
            setPortfolioData(response.data.result)
          }
      })
      .catch( error => {
        setError(JSON.stringify(error));
        if (error.response) {
          // Request made and server responded
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
      })

    return () => {mounted = false}
  }, []);

  return (
    <div>
      <h1>Returned from API</h1>
      <p>{portfolioData}</p>
      <p>{error}</p>
    </div>
  );
};

function AppBase() {
  return (
    <UserComponent/>
  );
}

const App = withAuthenticator(AppBase);

export { App as default, AppBase };
