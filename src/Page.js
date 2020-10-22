import React, { useEffect, useState } from 'react';
import { TableConfigurable } from "./Table"

const Page = (props) => {

    const [portfolio,setPortfolio] = useState(null);
    useEffect( () => {
        let mounted = true;
        const fetchPortfolio = async () => {
            if(props.backend) {
                props.backend.getPortfolio().then( data => {
                    if(mounted) {
                        setPortfolio(data)
                    }
                }).catch( error => {
                        console.log("Error from props.backend.getPortfolio():");
                        console.log(error);
                });
            }
        }
        fetchPortfolio();
        return () => {mounted = false};
    },[props.backend]);

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
    if (portfolio===null) return "Loading...";
    return (
        <div>
            <TableConfigurable data={portfolio} columns={columns}></TableConfigurable>
        </div>
    )
}

export { Page };