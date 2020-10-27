import React, { useEffect, useState } from 'react';
import { TableConfigurable } from "./Table"

const Page = (props) => {


    const [portfolio, setPortfolio] = useState(null);
    const [preEditPortfolio, setPreEditPortfolio] = useState(null);

    useEffect(() => {
        let mounted = true;
        const fetchPortfolio = async () => {
            if (props.backend) {
                props.backend.getPortfolio().then(data => {
                    if (mounted) {
                        setPortfolio(data);
                        setPreEditPortfolio(data);
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

    const handleTableUpdate = data => {
        setPortfolio(data);
    };

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

    // const [portfolioBeforeEditClick,setPortfolioBeforeEditClick] = useState(null);
    const handleEditClick = () => {
        setPageState("editing");
    }
    const handleCancelClick = () => {
        setPageState("regular");
        setPortfolio(preEditPortfolio)
    }
    const handleSaveClick = () => {
        setPageState("regular");
        setPreEditPortfolio(portfolio);
        props.backend.setPortfolio(portfolio);
    }

    if (portfolio === null) return "Loading...";
    return (
        <div>
            <TableConfigurable
                data={portfolio}
                columns={columns}
                edit={pageState === "editing"}
                onUpdate={handleTableUpdate}
            />
            <PageStateButtons
                state={pageState}
                onEditClick={handleEditClick}
                onCancelClick={handleCancelClick}
                onSaveClick={handleSaveClick}
            />
        </div>
    )
};


const PageStateButtons = ({ state, onEditClick, onCancelClick, onSaveClick }) => {
    if (state === "regular") {
        return (
            <button onClick={onEditClick}>Edit</button>
        )
    }
    if (state === "editing") {
        return (
            <div>
                <button onClick={onCancelClick}>Cancel</button>
                <button onClick={onSaveClick}>Save</button>
            </div>
        )
    }
    return null;
};

export { Page };