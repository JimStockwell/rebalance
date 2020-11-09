/* eslint-disable import/first */
//
// Wrapper for backend API
// (Includes a null version constructor)
//
// BackendApi: Getting things from the backend and presenting it in a convenient way.
//

// needed to fix amplify signin
//global.crypto = require('crypto');
import Amplify, { Auth, API } from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);
API.configure();

const apiName = "api";
const portfolioPath = "/portfolio";
export default class BackendApi {

    static createNull() {
        return new BackendApi(new NullAPI(), new NullAuth());
    }

    static create() {
        return new BackendApi(API, Auth);
    }

    constructor(api, auth) {
        this._api = api;
        this._auth = auth;
    }

    /* Returns promise of data array of holdings.
     * (promise of empty array in the case of an error).
     */
    async getPortfolio() {
        const myInit = { // OPTIONAL
            headers: {}, // OPTIONAL
            response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
        };

        return (
            this._api.get(apiName, portfolioPath, myInit)
                .then(response => {
                    return response.data;
                })
        );
    }

    async setPortfolio(body) { // inspired by [Updating data](https://docs.amplify.aws/lib/restapi/update/q/platform/js)
        const myInit = {
            body: body,
            headers: {}, // OPTIONAL
        };

        return this._api.put(apiName, portfolioPath, myInit);
        // No error catching here, so we propigate out errors
    }

    async signIn(username, password) {
        try {
            await this._auth.signIn(username, password);
        } catch (error) {
            console.log('Error signing in.');
            console.log(error);
        }
    }

    async getPrice(ticker) { // inspired by [Fetching data](https://docs.amplify.aws/lib/restapi/fetch/q/platform/js)
        const myInit = { // OPTIONAL
            'queryStringParameters': {
                'ticker': ticker
            },
            headers: {}, // OPTIONAL
            response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
        };

        return this._api.get(apiName, "/prices", myInit)
            .then(response => ({ ticker: ticker, price: response.data.c }));
    }

    // Only works with null version
    addPrice(priceObject) {
        this._api.addPrice(priceObject)
    }
}

class NullAPI {
    _portfolioData = {}; // TODO: Rename to _portfolioData
    _pricesData = new Map();
    get(api, path, init) {
        if(path==="/portfolio") {
            const value = { data: this._portfolioData };
            return new Promise(function (res, rej) { res(value) });
        }
        if(path==="/prices") {
            const value = { data: {c: this._pricesData.get(init.queryStringParameters.ticker)}};
            return new Promise(function (res, rej) { res( value )});
        }
    }
    put(api, path, init) {
        this._portfolioData = init.body;
        return new Promise(function (res, rej) { res() });
    }
    addPrice({ticker, price}) {
        this._pricesData.set(ticker, price);
    }
}

class NullAuth {
    signIn() { }
}
