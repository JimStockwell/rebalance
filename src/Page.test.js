import React from 'react';
import { render, screen, waitForElement, fireEvent } from '@testing-library/react';
import { Page } from './Page';
import BackendApi from './BackendApi';

// -----------------
// Data not loaded
// -----------------

test('Page with no data source shows loading message', () => {
    render(<Page />);

    const el = screen.getByText(/Loading/);
    expect(el).toBeInTheDocument();
});

// ---------------------
// Initial mode
// ---------------------

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

});

test('When simply displaying the portfolio, the table is not in edit mode', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([{ ticker: "SPX", qty: 700, pct: 100 }]);

    render(<Page backend={backendApi} />);

    await waitForElement(() => screen.queryByText("Edit"));
    expect(screen.queryByText("Add New Row")).not.toBeInTheDocument(); // "Add New Row" is an edit control from Table
})

//----------
// Edit mode
//----------

test('In edit mode, Edit button is gone, Cancel and Save appear', async () => {
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

test('In edit mode, the table is in edit mode too', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([{ ticker: "SPX", qty: 700, pct: 100 }]);
    render(<Page backend={backendApi} />);
    const editButton = await waitForElement(() => screen.queryByText("Edit"));

    fireEvent.click(editButton);

    expect(screen.getByText("Add New Row")).toBeInTheDocument(); // "Add New Row" is an edit control from Table
});

test('When Table adds rows, the new rows show up', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([{ ticker: "SPX", qty: 700, pct: 100 }]);
    render(<Page backend={backendApi} />);
    const rowsBeforeAdd = countOfRows(await waitForElement(() => screen.queryByRole("table")));
    const editButton = await waitForElement(() => screen.queryByText("Edit"));
    fireEvent.click(editButton);
    const addNewRowButton = await waitForElement(() => screen.queryByText("Add New Row"));

    fireEvent.click(addNewRowButton);

    expect(countOfRows(await waitForElement(() => screen.queryByRole("table")))).toBe(rowsBeforeAdd + 1);
});

test('Cancel button exits edit mode', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([{ ticker: "SPX", qty: 700, pct: 100 }]);
    render(<Page backend={backendApi} />);
    const editButton = await waitForElement(() => screen.queryByText("Edit"));
    fireEvent.click(editButton);
    const cancelButton = await waitForElement(() => screen.queryByText("Cancel"));

    fireEvent.click(cancelButton);

    expect(await waitForElement(() => screen.queryByText("Edit"))).toBeInTheDocument();
    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
    expect(screen.queryByText("Save")).not.toBeInTheDocument();
});

test('Cancel button restores pre-edit table data', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([{ ticker: "SPX", qty: 700, pct: 100 }]);
    render(<Page backend={backendApi} />);

    // Edit the table, add a line, then cancel
    const rowsBeforeAdd = countOfRows(await waitForElement(() => screen.queryByRole("table")));
    const editButton = await waitForElement(() => screen.queryByText("Edit"));
    fireEvent.click(editButton);
    const addNewRowButton = await waitForElement(() => screen.queryByText("Add New Row"));
    fireEvent.click(addNewRowButton);
    const cancelButton = await waitForElement(() => screen.queryByText("Cancel"));
    fireEvent.click(cancelButton);

    // Confirm the table is as it was before
    expect(countOfRows(await waitForElement(() => screen.queryByRole("table")))).toBe(rowsBeforeAdd);
});

test('Save button exits edit mode', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([{ ticker: "SPX", qty: 700, pct: 100 }]);
    render(<Page backend={backendApi} />);
    const editButton = await waitForElement(() => screen.queryByText("Edit"));
    fireEvent.click(editButton);
    const saveButton = await waitForElement(() => screen.queryByText("Save"));

    fireEvent.click(saveButton);

    expect(await waitForElement(() => screen.queryByText("Edit"))).toBeInTheDocument();
    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
    expect(screen.queryByText("Save")).not.toBeInTheDocument();
});

test('Save button does not restore pre-edit table data', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([{ ticker: "SPX", qty: 700, pct: 100 }]);
    render(<Page backend={backendApi} />);

    // Edit the table, add a line, then save
    const rowsBeforeAdd = countOfRows(await waitForElement(() => screen.queryByRole("table")));
    const editButton = await waitForElement(() => screen.queryByText("Edit"));
    fireEvent.click(editButton);
    const addNewRowButton = await waitForElement(() => screen.queryByText("Add New Row"));
    fireEvent.click(addNewRowButton);
    const saveButton = await waitForElement(() => screen.queryByText("Save"));
    fireEvent.click(saveButton);

    // Confirm the table is still as it was before
    expect(countOfRows(await waitForElement(() => screen.queryByRole("table")))).toBe(rowsBeforeAdd + 1);
});

test('Save button saves to back-end', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([{ ticker: "SPX", qty: 700, pct: 100 }]);
    render(<Page backend={backendApi} />);

    // Edit the table, add a line, then save
    const editButton = await waitForElement(() => screen.queryByText("Edit"));
    fireEvent.click(editButton);
    const addNewRowButton = await waitForElement(() => screen.queryByText("Add New Row"));
    fireEvent.click(addNewRowButton);
    const saveButton = await waitForElement(() => screen.queryByText("Save"));
    fireEvent.click(saveButton);

    // Confirm the updated table was written to the back end
    expect(await backendApi.getPortfolio()).toEqual([{ ticker: "SPX", qty: 700, pct: 100 }, { ticker: "", qty: "", pct: "" }]);
});

test('Cancel after prior edit brings us to saved data, not original data', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([{ ticker: "SPX", qty: 700, pct: 100 }]); // ------------------ 2 rows
    render(<Page backend={backendApi} />);
    const rowsBeforeAdd = countOfRows(await waitForElement(() => screen.queryByRole("table")));
    let editButton = await waitForElement(() => screen.queryByText("Edit"));
    fireEvent.click(editButton);
    const addNewRowButton = await waitForElement(() => screen.queryByText("Add New Row"));
    fireEvent.click(addNewRowButton); // -------------------------------------------------------- 3 rows
    const saveButton = await waitForElement(() => screen.queryByText("Save"));
    fireEvent.click(saveButton); // ------------------------------------------------------------- 3 rows
    editButton = await waitForElement(() => screen.queryByText("Edit"))
    fireEvent.click(editButton);
    const cancelButton = screen.getByText("Cancel"); // ----------------------------------------- 3 rows still!

    fireEvent.click(cancelButton);

    expect(countOfRows(await waitForElement(() => screen.queryByRole("table")))).toBe(rowsBeforeAdd + 1);
});

test.todo('Different users have their own data');
test.todo('If data fails to save, we complain and stay on the edit screen');
test.todo('If data fails to load, do something sensible (what do we do now?)');
test.todo('Prices');
test.todo('Calculated fields');


// ---------------------- utility functions ---------------------

function countOfRows(node) {
    return node.querySelectorAll('tr').length;
}