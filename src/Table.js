import React from 'react';
import { useTable } from 'react-table';
  
function TableConfigurable(props) {
  
    const data = props.data;
    const columns = props.columns;

    const tableInstance = useTable({ columns, data })

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = tableInstance

    return (
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
            return(
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
    )
}

export { TableConfigurable };
