"use strict";

import React from 'react';
import { render, screen, waitForElement } from '@testing-library/react';
import { Page } from './Page';
import BackendApi from './BackendApi';

test('Page with no data source shows loading message', () => {
    render( <Page/> );

    const el = screen.getByText(/Loading/);
    expect(el).toBeInTheDocument();
});

test('Page can read and display a one line portfolio', async () => {
    const backendApi = BackendApi.createNull();
    backendApi.setPortfolio([{ticker: "SPX", qty: 700, pct: 100}]);
    render( <Page backend={backendApi}/>);

    const el = await waitForElement(() => screen.queryByText(/SPX/));
    expect(el).toBeInTheDocument();
});

// TODO: Error handling, control, get and merge prices
//       Not just hard coded, but reflects what is provided by backend.
//       Confirm that in display state, is not editable
//       Confirm that in edit state, is infact editable
//       Confirm that in edit state, edits roll through to calculated fields
//       Confirm