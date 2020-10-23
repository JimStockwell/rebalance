import React, { useEffect, useState } from 'react';
import { TableConfigurable } from "./Table"

const Page = (props) => {

    const [portfolio, setPortfolio] = useState(null);
    useEffect(() => {
        let mounted = true;
        const fetchPortfolio = async () => {
            if (props.backend) {
                props.backend.getPortfolio().then(data => {
                    if (mounted) {
                        setPortfolio(data)
                    }
                }).catch(error => {
                    console.log("Error from props.backend.getPortfolio():");
                    console.log(error);
                });
            }
        }
        fetchPortfolio();
        return () => { mounted = false };
    }, [props.backend]);

    const [pageState, setPageState] = useState("regular"); // Alternative is "editing"

    const columns = [
        {
            Header: 'Ticker',
            accessor: 'ticker'
        },
        {
            Header: 'Shares',
            accessor: 'qty'
        },
        {
            Header: 'Target %',
            accessor: 'pct'
        }
    ];
    if (portfolio === null) return "Loading...";
    return (
        <div>
            <TableConfigurable data={portfolio} columns={columns}></TableConfigurable>
            <PageStateButtons state={pageState} onNewState={setPageState} />
        </div>
    )
}

/* Attributes:
 * state = "editing" | "regular"
 * onNewState = callback, passing new state
 */
const PageStateButtons = props => {
    if (props.state === "regular") {
        return (
            <button onClick={() => props.onNewState("editing")}>Edit</button>
        )
    }
    if (props.state == "editing") {
        return (
            <div>
                <button>Cancel</button>
                <button>Save</button>
            </div>
        )
    }
    return null;
}

export { Page };