import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { TableConfigurable } from './Table';

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
  expectToBeInTheDocument(/The/);
  expectToBeInTheDocument(/Blight/);

  const row = screen.getByText('Mary').closest("tr");
  expect(within(row).getByText('Poppins')).toBeInTheDocument();
});

test('TableConfigurable hides edit mode controls when out of edit mode', () => {
  const { data, columns } = getDefaultTestData();

  render(<TableConfigurable data={data} columns={columns} />)

  expect(screen.queryByText('Add New Row')).not.toBeInTheDocument();
});

test('When in regular mode, cells are NOT editable', () => {
  const { data, columns } = getDefaultTestData();
  render(<TableConfigurable data={data} columns={columns} />)

  const element = screen.queryByDisplayValue("Mary"); // not found because is regular text

  expect(element).not.toBeInTheDocument
});

//------------------ Edit Mode -------------------------

test('TableConfigurable displays "Add New Row" button when in edit mode', () => {
  const { data, columns } = getDefaultTestData();

  render(<TableConfigurable data={data} columns={columns} edit />)

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
  render(<TableConfigurable data={data} columns={columns} edit />);
  const button = screen.getByText('Add New Row').closest("button");
  const rowsBeforeAdding = countOfRows(screen.getByRole("table"));
  const textBeforeAdding = screen.getByRole("table").textContent;

  fireEvent.click(button);

  expect(countOfRows(screen.getByRole("table"))).toBe(rowsBeforeAdding + 1);
  expect(screen.getByRole("table").textContent).toBe(textBeforeAdding);
});

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
      col1: 'The',
      col2: 'Blight'
    }
  ];
  return { data, columns };
}

function countOfRows(node) {
  return node.querySelectorAll('tr').length;
}