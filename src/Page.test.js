"use strict";

import React from 'react';
import { render, screen, waitForElement, waitForElementToBeRemoved, fireEvent } from '@testing-library/react';
import { Page } from './Page';
import BackendApi from './BackendApi';

test('Page with no data source shows loading message', () => {
    render(<Page />);

    const el = screen.getByText(/Loading/);
    expect(el).toBeInTheDocument();
});

test('Page can read and display a one line portfolio', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([{ ticker: "SPX", qty: 700, pct: 100 }]);

    render(<Page backend={backendApi} />);

    const el = await waitForElement(() => screen.queryByText(/SPX/));
    expect(el).toBeInTheDocument();
});

test('When simply displaying the portfolio, there is an edit button (after the portfolio is loaded)', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([{ ticker: "SPX", qty: 700, pct: 100 }]);

    render(<Page backend={backendApi} />);

    const text = await waitForElement(() => screen.queryByText("Edit"));
    expect(text).toBeInTheDocument();
    const button = text.closest("button");
    expect(button).toBeInTheDocument();
    const save = screen.queryByText("Save");
    expect(save).not.toBeInTheDocument();
    const cancel = screen.queryByText("Cancel");
    expect(cancel).not.toBeInTheDocument();

})

test('When edit button is clicked, replace with cancel and save choices', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([{ ticker: "SPX", qty: 700, pct: 100 }]);
    render(<Page backend={backendApi} />);
    const text = await waitForElement(() => screen.queryByText("Edit"));
    const button = text.closest("button");

    fireEvent.click(button);

    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
});

// test('When edit button is clicked, table goes into edit mode', async () => {
// });

// TODO: Error handling, control, get and merge prices
//       Not just hard coded, but reflects what is provided by backend.
//       Confirm that in display state, is not editable
//       Confirm that in edit state, is infact editable
//       Confirm that in edit state, edits roll through to calculated fields
