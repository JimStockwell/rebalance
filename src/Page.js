// The Page componenet is responsible for
// Displaying the Table,
//   providing it with data to display,
//   and a means (onUpdate) to save any changed data.
//   And providing it with pricing too.
// Controls for changing edit/cancel/save mode.
//
// Note: Page/Table Interface
// We pass the portfolio data, and pricing data, into Table,
// but table only passes back portfolio data,
// or if it passes back more, then we should only respond to portfolio updates.
//
// By portfolio data, the following are meant: ticker, quantity, and target fields.
//

import React, { useEffect, useState } from 'react';
import { TableConfigurable } from "./Table"
import './Page.css';

const Directions = ({state}) => {
    if(state === "regular") {
        return(
            <p>
                Click the Edit button to add, delete, or change holdings.
            </p>
        )
    } else {
        return(
            <p>
                Click Cancel or Save to undo or save any changes you've made.
                To edit a cell, just click the cell and change it.
                To delete a row, use the "Delete Row" button.
            </p>
        )
    }
}

const Page = ({ backend }) => {


    const [portfolio, setPortfolio] = useState(null);
    const [preEditPortfolio, setPreEditPortfolio] = useState(null);

    const [priceLoadsNeededSoFar, setLoadPrices] = useState(0); // any change signals the need to load pricing
    const [prices, setPrices] = useState([]);

    const [pageState, setPageState] = useState("regular"); // Alternative is "editing"

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
                        setLoadPrices(count => count + 1);
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

    useEffect(() => {
        // we have been signaled to load prices
        if (portfolio && pageState === "regular") {
            for (let i = 0; i < portfolio.length; i++) {
                backend.getPrice(portfolio[i].ticker).then(prObj => {
                    setPrices(prevPrices => {
                        const newPrices = prevPrices.concat();
                        newPrices[i] = prObj;
                        return newPrices;
                    })
                })
            }
        }
        // we have launched all our price update asyncs
    }, [priceLoadsNeededSoFar, portfolio, backend, pageState]);

    const handleTableUpdate = data => {
        //
        // `data` may contain the entire table as shown to the user,
        // but we only want ticker, qty, and pct written into the portfolio data
        //
        setPortfolio(data.map(({ ticker, qty, pct }) => { return { ticker, qty, pct } }));
    };

    let columns;
    if (pageState === "regular") {
        columns = [
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
            },
            {
                Header: 'Value',
                accessor: 'value'
            },
            {
                Header: 'Buy',
                accessor: 'buy'
            }
        ];
    } else {
        columns = [
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
    }

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
        setLoadPrices(count => count + 1);
    }

    const tableFrom = ({ portfolio, prices }) => {
        if (portfolio === null) return null;
        if (pageState === "regular") {
            const priceMap = new Map();
            prices.forEach(({ ticker, price }) => priceMap.set(ticker, price));
            const firstPass = portfolio.map(portfolioRow => {
                const price = priceMap.get(portfolioRow.ticker) || 0; // TODO: Zero isn't very safe.  A show stoper like NaN would be better.
                return { ...portfolioRow, price: price, value: price * portfolioRow.qty };
            });
            const totalValue = firstPass.map(({ value }) => value).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            const totalPct = firstPass.map(({ pct }) => Number(pct)).reduce((accumulator, currentValue) => accumulator + currentValue, 0)
            const secondPass = firstPass.map(row => {
                return ({ ...row, value: Math.round(row.value), buy: Math.round((row.pct / totalPct - row.value / totalValue) * totalValue / row.price) });
            });
            return secondPass;
        } else {
            return portfolio;
        }
    };

    if (portfolio === null) return "Loading...";
    return (
        <div>
            <Directions state={pageState}/>
            <TableConfigurable
                data={tableFrom({ portfolio, prices })}
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
            <div className="controls">
                <button className="pure-button pure-button-primary" onClick={onEditClick}>Edit</button>
            </div>
        )
    }
    if (state === "editing") {
        return (
            <div className="controls">
                <button className="pure-button" onClick={onCancelClick}>Cancel</button>
                <button className="pure-button pure-button-primary" onClick={onSaveClick}>Save</button>
            </div>
        )
    }
    return null;
};

export { Page };