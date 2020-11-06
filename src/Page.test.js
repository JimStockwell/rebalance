import React from 'react';
import { render, screen, waitForElement, wait, fireEvent, within, findByText } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
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
    const editButton = await waitForElement(() => screen.queryByText("Edit"));
    fireEvent.click(editButton);
    const addNewRowButton = await waitForElement(() => screen.queryByText("Add New Row"));
    fireEvent.click(addNewRowButton);
    const saveButton = await waitForElement(() => screen.queryByText("Save"));

    fireEvent.click(saveButton);

    // Confirm the updated table was written to the back end
    await screen.findByRole("table");
    expect(await backendApi.getPortfolio()).toEqual([{ ticker: "SPX", qty: 700, pct: 100 }, { ticker: "", qty: "", pct: "" }]);
});

test('Cancel after prior edit brings us to saved data, not original data', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([{ ticker: "SPX", qty: 700, pct: 100 }]);
    render(<Page backend={backendApi} />);
    const rowsBeforeAdd = countOfRows(await waitForElement(() => screen.queryByRole("table")));
    await clickByName("Edit");
    await clickByName("Add New Row"); // bumped up to "+1" rows
    await clickByName("Save");
    await clickByName("Edit");

    await clickByName("Cancel");      // should still be "+1" rows

    const finalTable = await waitForElement(() => screen.queryByRole("table"));
    expect(countOfRows(finalTable)).toBe(rowsBeforeAdd + 1);
});

//------------------
// Prices and Values
//------------------

test('Prices retrieve and display', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([
        { ticker: "SPX", qty: 700, pct: 100 },
        { ticker: "BND", qty: 800, pct: 40 }
    ]);
    backendApi.addPrice({ ticker: "SPX", price: 3390.00 });
    backendApi.addPrice({ ticker: "BND", price: 88.04 });

    render(<Page backend={backendApi} />);

    const row1 = (await screen.findByText('SPX')).closest("tr");
    await within(row1).findByText('3390');
    const row2 = (await screen.findByText('BND')).closest("tr");
    await within(row2).findByText('88.04');
});

test('Prices update after save', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([{ ticker: "SPX", qty: 700, pct: 100 }]);
    backendApi.addPrice({ ticker: "BND", price: 88.04 });
    render(<Page backend={backendApi} />);
    await clickByName("Edit");
    const tickerCell = await screen.findByDisplayValue('SPX');
    await userEvent.type(tickerCell, "BND");
    fireEvent.blur(tickerCell);

    await clickByName("Save");

    await screen.findByText('88.04');
});

test('In regular mode, priced rows have calculated values too', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([{ ticker: "SPX", qty: 700, pct: 100 }]);
    backendApi.addPrice({ ticker: "SPX", price: 3390 });
    const expectedValue = 700 * 3390;

    render(<Page backend={backendApi} />);

    const row1 = (await screen.findByText('SPX')).closest("tr");
    await within(row1).findByText(expectedValue.toString());
});

test('In edit mode, there are no prices or values', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([{ ticker: "SPX", qty: 700, pct: 100 }]);
    backendApi.addPrice({ ticker: "SPX", price: 88.04 });
    render(<Page backend={backendApi} />);
    await clickByName("Edit");
    expect(screen.getByText("Add New Row")).toBeInTheDocument();

    expect(screen.queryByText("Price")).not.toBeInTheDocument();
    expect(screen.queryByText("Value")).not.toBeInTheDocument();
    expect(screen.queryByText("Buy")).not.toBeInTheDocument();
});
//------------------
// Buy
//------------------

const BUY_COLUMN = 5;

test('There is a buy column', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([
        { ticker: "A", qty: 700, pct: 100 },
        { ticker: "B", qty: 800, pct: 40 }
    ]);
    backendApi.addPrice({ ticker: "A", price: 3390.00 });
    backendApi.addPrice({ ticker: "B", price: 88.04 });

    render(<Page backend={backendApi} />);

    await screen.findByText((3390 * 700).toString()); // wait for the component to fully update 
    screen.getByText('Buy');
});

test('When there is only one item, sell = 0', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([
        { ticker: "A", qty: 7, pct: 2 },
    ]);
    backendApi.addPrice({ ticker: "A", price: 3 });

    render(<Page backend={backendApi} />);
    await screen.findByText("21"); // wait for component to fully render

    expect(columnValue('A', BUY_COLUMN)).toBe("0");
});

test('Sell formula is shown correct when we want all one item', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([
        { ticker: "A", qty: 7, pct: 100 },
        { ticker: "B", qty: 22, pct: 0 }
    ]);
    backendApi.addPrice({ ticker: "A", price: 11 });
    backendApi.addPrice({ ticker: "B", price: 7 });

    render(<Page backend={backendApi} />);
    await screen.findByText("77"); // let it finish rendering

    expect(columnValue('A', BUY_COLUMN)).toBe("14");
    expect(columnValue('B', BUY_COLUMN)).toBe("-22");
});

test('Sell formula is shown correct when we have all one item', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([
        { ticker: "A", qty: 0, pct: 50 },
        { ticker: "B", qty: 200, pct: 50 }
    ]);
    backendApi.addPrice({ ticker: "A", price: 2 });
    backendApi.addPrice({ ticker: "B", price: 3 });

    render(<Page backend={backendApi} />);
    await screen.findByText("600");

    expect(columnValue('A', BUY_COLUMN)).toBe("150");
    expect(columnValue('B', BUY_COLUMN)).toBe("-100");
});

test('Sell formula still works if we get strings in instead of numbers', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.setPortfolio([
        { ticker: "A", qty: 0, pct: 50 },
        { ticker: "B", qty: "200", pct: "50" }
    ]);
    backendApi.addPrice({ ticker: "A", price: 2 });
    backendApi.addPrice({ ticker: "B", price: "3" });

    render(<Page backend={backendApi} />);
    await screen.findByText("600");

    expect(columnValue('A', BUY_COLUMN)).toBe("150");
    expect(columnValue('B', BUY_COLUMN)).toBe("-100");
});


test.todo('Different users have their own data');
test.todo('If data fails to save, we complain and stay on the edit screen');
test.todo('If data fails to load, do something sensible (what do we do now?)');
test.todo('Calculated fields');


// ---------------------- utility functions ---------------------

const countOfRows = node => {
    return node.querySelectorAll('tr').length;
};

const columnValue = (ticker, columnNumber) => {
    const row = screen.getByText(ticker).closest("tr");
    const result = row.querySelectorAll('td')[columnNumber].textContent;
    return result;
}

const clickByName = async label => {
    const button = await screen.findByText(label);
    fireEvent.click(button);
};