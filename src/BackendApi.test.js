// import { findAllByAltText } from '@testing-library/react';
import BackendApi from './BackendApi';

test('setPortfolio reports okay', () => {
    // Arrange...
    const backendApi = BackendApi.create();

    return(
        backendApi.signIn(process.env.TEST_USERNAME, process.env.TEST_PASSWORD)

        // Act...
        .then(() => {
            backendApi.setPortfolio([{ticker: 'SPX', qty: 100, pct: 100}]);
        })
    )
});

test('factory really returns something', () => {
    const backendApi = BackendApi.create();

    expect(backendApi).not.toBe(null);
    expect(backendApi).not.toBe(undefined);
});

const writeAndReadBack = async (backendApi, testValue) => {

    return (
        backendApi.signIn(process.env.TEST_USERNAME, process.env.TEST_PASSWORD)

            // Act...
            .then(() => {
                return backendApi.setPortfolio(testValue);
            })
            .then(() => {
                return backendApi.getPortfolio();
            })

            // Assert...
            .then((portfolio) => {
                expect(portfolio).toEqual(testValue);
            })
    );

};

test('backend recalls same value stored, original hard coded value', () => {
    const testValue = [{ ticker: "SPX", qty: 700, pct: 100 }];
    return (writeAndReadBack(BackendApi.create(), testValue));
});

test('backend recalls same value stored, new non-hard coded value', () => {
    const testValue = [{ ticker: "SPX", qty: 600, pct: 100 }];
    return (writeAndReadBack(BackendApi.create(), testValue));
});

// --------------------------- Nullable -----------------------------

test('backend recalls same value stored, original hard coded value', () => {
    const testValue = [{ ticker: "SPX", qty: 700, pct: 100 }];
    return (writeAndReadBack(BackendApi.createNull(), testValue));
});

test('backend recalls same value stored, new non-hard coded value', () => {
    const testValue = [{ ticker: "SPX", qty: 600, pct: 100 }];
    return (writeAndReadBack(BackendApi.createNull(), testValue));
});

// TODO:
//   Test that changes to setPortfolio are reflected in getPortfolio
//   Test that changes to user result in change of stored data
//   Everything with prices still
//   Backend gives out CORS headers that will work whether the front-end host
//     is the development host or the production host.
//   Test DELETE