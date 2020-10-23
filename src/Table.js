import React, { useState } from 'react';
import { useTable } from 'react-table';

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
    const tableInstance = useTable({ columns, data })

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
