import React, { useMemo, useCallback } from 'react';
import { useTable } from 'react-table';

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
    // TODO:
    //   React.useEffect(() => {
    //     setValue(initialValue)
    //   }, [initialValue])

    return <input value={value} onChange={onChange} onBlur={onBlur} />
}



/* data and columns - per react-table documentation
 * edit - truthy to show edit controls and allow editing
 * onUpdate - a callback for providing updates to the data
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
            tmpData.splice(index,1);
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
    }, [columns,handleDelete]);


    const tableInstance = useTable({ columns: columnsWithDelete, data, defaultColumn, updateMyData })

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
                edit ? <button onClick={handleAddNewRow}>Add New Row</button> : null
            }

        </div>
    )
}

export { TableConfigurable };
