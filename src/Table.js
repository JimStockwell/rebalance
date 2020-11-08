//
// See "Note: Page/Table Interface" in Page.js
// for an explanation of Table's "data" and "onUpdate".
//

import React, { useMemo, useCallback } from 'react';
import { useTable } from 'react-table';
import './Table.css';

// See https://react-table.tanstack.com/ for react-table documentation
// and https://github.com/tannerlinsley/react-table/blob/master/examples/editable-data/src/App.js for an editable table

// Create an editable cell renderer
const EditableCell = ({
    value: initialValue,
    row: { index },
    column: { id },
    updateMyData, // A custom callback, passed through useTable
}) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue)

    const onChange = e => {
        setValue(e.target.value)
    }

    // We'll only update the over all table's data when the input is blurred
    const onBlur = () => {
        updateMyData(index, id, value)
    }

    // If the initialValue is changed external, sync our state up with it
    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    return <input value={value} onChange={onChange} onBlur={onBlur} />
}



/* data - All the data for our table, but not control buttons.  See react-table documentation.
 * columns - per react-table documentation.  Does not include control buttons.
 * edit - truthy to show edit controls and allow editing
 * onUpdate - a callback for providing updates to the data
 * 
 * Note: columns property of Table
 * "columns" determines what order to present the columns in in the UI.
 * We do not get a choice of names (accessors), those are expected by Table.
 * We get a choice of what order they come in,
 * and whether they are included in the UI.
 * Whether included or not, they are still calculated.
 */
function TableConfigurable({ data, columns, edit, onUpdate }) {

    const handleAddNewRow = () => {
        const tmpData = data.concat();
        const arrayOfRowEntries = columns.map(columnDefinition => [columnDefinition.accessor, ""]);
        const blankRowObject = Object.fromEntries(arrayOfRowEntries);
        tmpData.push(blankRowObject);
        onUpdate && onUpdate(tmpData);
    };

    const updateMyData = (rowIndex, columnId, value) => {
        const update = old =>
            old.map((row, index) => {
                if (index === rowIndex) {
                    return {
                        ...old[rowIndex],
                        [columnId]: value,
                    }
                }
                return row
            })
        onUpdate(update(data));
    }

    // Set the cell renderer to editable or not, depending on edit state
    const defaultColumn = edit ? {
        Cell: EditableCell,
    } : {};

    const handleDelete = useCallback(
        (index) => {
            const tmpData = data.concat();
            tmpData.splice(index, 1);
            onUpdate && onUpdate(tmpData);
        },
        [data, onUpdate]
    );

    const columnsWithDelete = useMemo(() => {
        const x = columns.concat();
        x.push({
            Header: '',
            accessor: "delete-button",
            Cell: row => (
                <button onClick={() => handleDelete(row.index)}>Delete Row</button>
            )
        });
        return x;
    }, [columns, handleDelete]);


    const tableInstance = useTable({ columns: edit ? columnsWithDelete : columns, data, defaultColumn, updateMyData })

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = tableInstance

    return (
        <div>
            <table className="pure-table pure-table-bordered" {...getTableProps()}>
                <thead>
                    {// Loop over the header rows
                        headerGroups.map(headerGroup => (
                            // apply the header row properties
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {//Loop over the headers in each column
                                    headerGroup.headers.map(column => (
                                        // Apply the header cell properties
                                        <th {...column.getHeaderProps()}>
                                            {// Render the header
                                                column.render('Header')}
                                        </th>
                                    ))}
                            </tr>
                        ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map(row => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return (
                                        <td
                                            {...cell.getCellProps()}
                                        >
                                            {cell.render('Cell')}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    }
                    )}
                </tbody>
            </table>
            {
                edit ? <button className="pure-button" onClick={handleAddNewRow}>Add New Row</button> : null
            }

        </div>
    )
}

export { TableConfigurable };
