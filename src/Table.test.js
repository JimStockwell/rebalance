import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { TableConfigurable } from './Table';

// -------------- regular mode ---------------------

test('TableConfigurable renders provided data', () => {
  const { data, columns } = getDefaultTestData();

  render(<TableConfigurable data={data} columns={columns} />);

  const expectToBeInTheDocument = (matcher) => {
    const el = screen.getByText(matcher);
    expect(el).toBeInTheDocument();
  }

  expectToBeInTheDocument(/First Col/);
  expectToBeInTheDocument(/Second Col/);
  expectToBeInTheDocument(/Mary/);
  expectToBeInTheDocument(/Poppins/);
  expectToBeInTheDocument(/Vernor/);
  expectToBeInTheDocument(/Vinge/);

  const row = screen.getByText('Mary').closest("tr");
  expect(within(row).getByText('Poppins')).toBeInTheDocument();
});

test('TableConfigurable hides edit mode controls when out of edit mode', () => {
  const { data, columns } = getDefaultTestData();

  render(<TableConfigurable data={data} columns={columns} />)

  expect(screen.queryByText('Add New Row')).not.toBeInTheDocument();
  expect(screen.queryByText('Delete Row')).not.toBeInTheDocument();
});

test('When in regular mode, cells are NOT editable', () => {
  const { data, columns } = getDefaultTestData();
  render(<TableConfigurable data={data} columns={columns} />)

  const element = screen.queryByDisplayValue("Mary"); // not found because is regular text

  expect(element).not.toBeInTheDocument();
});

//------------------ Edit Mode -------------------------

test('TableConfigurable displays "Add New Row" and button row delete buttons when in edit mode', async () => {
  const { data, columns } = getDefaultTestData();

  render(<TableConfigurable data={data} columns={columns} edit />)

  // There is an Add New Row button
  expect(screen.getByText('Add New Row').closest("button")).toBeInTheDocument();
});

test('When in edit mode, cells are editable', () => {
  const { data, columns } = getDefaultTestData();
  render(<TableConfigurable data={data} columns={columns} edit />)
  const element = screen.getByDisplayValue("Mary");

  userEvent.type(element, "Jill")
  expect(element).toHaveValue("Jill");
});

test('When "Add New Row" is clicked, a new blank row really is added', () => {
  const { data, columns } = getDefaultTestData();
  const arrayOfBlankEntries = columns.map(columnDefinition => [columnDefinition.accessor, ""]);
  const blankRowObject = Object.fromEntries(arrayOfBlankEntries);
  const expectedNewData = data.concat([blankRowObject]);
  const newDataHandler = jest.fn();

  render(<TableConfigurable data={data} columns={columns} edit onUpdate={newDataHandler} />);
  const addNewRowButton = screen.getByText('Add New Row');

  fireEvent.click(addNewRowButton);

  expect(newDataHandler).toHaveBeenCalledTimes(1);
  expect(newDataHandler).toHaveBeenCalledWith(expectedNewData);
});

test('When "Add New Row" is clicked with no callback, it does not crash', () => {
  const { data, columns } = getDefaultTestData();

  render(<TableConfigurable data={data} columns={columns} edit />);
  const addNewRowButton = screen.getByText('Add New Row');

  fireEvent.click(addNewRowButton);
});

test('When a cell is edited, it is reflected in the callback', () => {
  const { data, columns } = getDefaultTestData();
  const expectedNewData = [{ "col1": "Ms", "col2": "Poppins" }, { "col1": "Vernor", "col2": "Vinge" }]
  const newDataHandler = jest.fn();
  render(<TableConfigurable data={data} columns={columns} edit onUpdate={newDataHandler} />);
  const tickerCell = screen.getByDisplayValue('Mary');

  fireEvent.focus(tickerCell);
  userEvent.type(tickerCell, "Ms");
  fireEvent.blur(tickerCell);

  expect(newDataHandler).toHaveBeenCalledTimes(1);
  expect(newDataHandler).toHaveBeenCalledWith(expectedNewData);
});

test('When in edit mode, "Delete Row" buttons are available and delete rows', async () => {
  const { data, columns } = getDefaultTestData();
  const newData = data.concat();
  newData.shift();
  const expectedNewData = newData;
  const newDataHandler = jest.fn();
  render(<TableConfigurable data={data} columns={columns} onUpdate={newDataHandler} edit />)

  const deleteButtons = screen.getAllByText('Delete Row');
  expect(deleteButtons.length).toBe(data.length);

  fireEvent.click(deleteButtons[0]);

  expect(newDataHandler).toHaveBeenCalledTimes(1);
  expect(newDataHandler).toHaveBeenCalledWith(expectedNewData);
});
test.todo('In edit mode, the prices and calculated fields are not editable');

//------------------- Utility Functions ---------------

function getDefaultTestData() {
  const columns = [
    {
      Header: 'First Col',
      accessor: 'col1'
    },
    {
      Header: 'Second Col',
      accessor: 'col2'
    }
  ];
  const data = [
    {
      col1: 'Mary',
      col2: 'Poppins'
    },
    {
      col1: 'Vernor',
      col2: 'Vinge'
    }
  ];
  return { data, columns };
}
