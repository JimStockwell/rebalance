import React, { useState } from 'react';
import { useTable } from 'react-table';

// See https://react-table.tanstack.com/ for react-table documentation
// and https://github.com/tannerlinsley/react-table/blob/master/examples/editable-data/src/App.js for an editable table

// Create an editable cell renderer
const EditableCell = ({
    value: initialValue,
    row: { index },
    column: { id },
    // TODO:  updateMyData, // A custom callback
}) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue)

    const onChange = e => {
        setValue(e.target.value)
    }

    // We'll only update the over all table's data when the input is blurred
    const onBlur = () => {
        // TODO   updateMyData(index, id, value)
    }

    // If the initialValue is changed external, sync our state up with it
    // TODO:
    //   React.useEffect(() => {
    //     setValue(initialValue)
    //   }, [initialValue])

    return <input value={value} onChange={onChange} onBlur={onBlur} />
}



/* data and columns - per react-table documentation
 * edit - truthy to show edit controls and allow editing
 * newData - a callback for providing updates to the data
 */
function TableConfigurable(props) {

    const columns = props.columns;

    const [data, setData] = useState(props.data);
    const handleAddNewRow = () => {
        const tmpData = data.concat();
        const arrayOfRowEntries = columns.map(columnDefinition => [columnDefinition.accessor, ""]);
        const blankRowObject = Object.fromEntries(arrayOfRowEntries);
        tmpData.push(blankRowObject);
        setData(tmpData);
    };

    // Set the cell renderer to editable or not, depending on edit state
    const defaultColumn = props.edit ? {
        Cell: EditableCell,
    } : {};

    const tableInstance = useTable({ columns, data, defaultColumn, /* TODO: updateTableLocalData */ })

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = tableInstance

    return (
        <div>
            <table {...getTableProps()}>
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
                                            style={{
                                                padding: '10px',
                                                border: 'solid 1px gray',
                                                background: 'papayawhip',
                                            }}
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
                props.edit ? <button onClick={handleAddNewRow}>Add New Row</button> : null
            }

        </div>
    )
}

export { TableConfigurable };
