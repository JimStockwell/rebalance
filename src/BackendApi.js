"use strict";

//
// Wrapper for backend API
// (Includes a null version constructor)
//
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

    constructor(api,auth) {
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
        
        return(
            this._api.get(apiName,portfolioPath,myInit)
            .then(response => {
                return response.data;
             })
        );
    }

    async setPortfolio(body) { // inspired by https://docs.amplify.aws/lib/restapi/update/q/platform/js
        const myInit = {
            body: body,
            headers: {}, // OPTIONAL
        };
        
        return this._api.put(apiName, portfolioPath, myInit);
        // No error catching here, so we propigate out errors
    }

    async signIn(username, password) {
        try {
            const user = await this._auth.signIn(username, password);
        } catch (error) {
            console.log('error signing in', error);
        }
    }

}

class NullAPI {
    get(api,path,init) {
        const value = { data: [{ticker: "SPX", qty: 700, pct: 100}] };
        return new Promise(function(res,rej) {res(value)});
    }
    put(api,path,init) {
        return new Promise(function(res,rej) {res()});
    }
}

class NullAuth {
}
