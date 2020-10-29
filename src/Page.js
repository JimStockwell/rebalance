import React, { useEffect, useState } from 'react';
import { TableConfigurable } from "./Table"

const Page = ({backend}) => {


    const [portfolio, setPortfolio] = useState(null);
    const [preEditPortfolio, setPreEditPortfolio] = useState(null);

    useEffect(() => {
        let mounted = true;
        const fetchPortfolio = async () => {
            if (backend) {
                backend.getPortfolio().then(data => {
                    //
                    // data should contain only columns ticker, qty, and pct
                    //
                    if (mounted) {
                        setPortfolio(data);
                        setPreEditPortfolio(data);
                    }
                }).catch(error => {
                    console.log("Error from backend.getPortfolio():");
                    console.log(error);
                });
            }
        }
        fetchPortfolio();
        return () => { mounted = false };
    }, [backend]);

    const handleTableUpdate = data => {
        //
        // `data` may contain the entire table as shown to the user,
        // but we only want ticker, qty, and pct written into the portfolio data
        //
        setPortfolio(data.map(({ticker, qty, pct}) => {return {ticker, qty, pct}}));
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
        },
        {
            Header: 'Price',
            accessor: 'price'
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
        backend.setPortfolio(portfolio);
    }

    const prices = [{ticker: "SPX", price: 3390.68}, {ticker: "BND", price: 88.04}];

    const tableFrom = ({portfolio}) => {
        if(portfolio===null) return null;
        const map = new Map();
        prices.forEach(({ticker, price})=>map.set(ticker,price));
        const price = ticker => {
            return map.get(ticker); // can return `undefined`
        }
        return portfolio.map( ({ticker, qty, pct}) => {
            return {ticker, qty, pct, price: price(ticker)};
        });
    };

    if (portfolio === null) return "Loading...";
    return (
        <div>
            <TableConfigurable
                data={tableFrom({portfolio /*,prices*/})}
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