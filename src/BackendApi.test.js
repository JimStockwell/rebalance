import BackendApi from './BackendApi';

// - set, get, and delete Portfolio

test('setPortfolio reports okay', () => {
    // Arrange...
    const backendApi = BackendApi.create();

    return (
        backendApi.signIn(process.env.TEST_USERNAME, process.env.TEST_PASSWORD)

            // Act...
            .then(() => {
                backendApi.setPortfolio([{ ticker: 'SPX', qty: 100, pct: 100 }]);
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
        await backendApi.signIn(process.env.TEST_USERNAME, process.env.TEST_PASSWORD)

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

test('deleting the portfolio works', async () => {
    const backendApi = BackendApi.create();
    const testValue = [{ ticker: "SPX", qty: 600, pct: 100 }];
    await backendApi.signIn(process.env.TEST_USERNAME, process.env.TEST_PASSWORD)
    .then(() => {
        return backendApi.setPortfolio(testValue);
    })
    .then(() => {
        return backendApi.deletePortfolio();
    })
    .then(() => {
        return backendApi.getPortfolio();
    })

    // Assert...
    .then((portfolio) => {
        expect(portfolio).toEqual([]);
    })

})

// --------------------------- Nullable setPortfolio and getPortfolio ----------------------

test('backend recalls same value stored, original hard coded value', () => {
    const testValue = [{ ticker: "SPX", qty: 700, pct: 100 }];
    return (writeAndReadBack(BackendApi.createNull(), testValue));
});

test('backend recalls same value stored, new non-hard coded value', () => {
    const testValue = [{ ticker: "SPX", qty: 600, pct: 100 }];
    return (writeAndReadBack(BackendApi.createNull(), testValue));
});

// ----------------------------------- Pricing --------------------------------------------

test('Call to real getPrice returns data', async () => {
    const backendApi = BackendApi.create();
    await backendApi.signIn(process.env.TEST_USERNAME, process.env.TEST_PASSWORD)

    const result = await backendApi.getPrice("BWX");

    expect(result.ticker).toBe("BWX");
    expect(typeof (result.price)).toBe("number");
    expect(result.price).toBeGreaterThanOrEqual(0);
});

test('Call to null getPrice returns specific data', async () => {
    const backendApi = BackendApi.createNull();
    await backendApi.signIn(process.env.TEST_USERNAME, process.env.TEST_PASSWORD)

    backendApi.addPrice({ ticker: "BWX", price: 90.00 });
    const result = await backendApi.getPrice("BWX");

    expect(result.ticker).toBe("BWX");
    expect(result.price).toBe(90.00);
});

test.todo('setPrice should throw in non-null version');
test.todo('null Pricing sets and returns specific prices');
test.todo('null Pricing, when not set, throws');


test.todo('Changes in user result in change of strored data');
test.todo('Backend gives out CORS headers that will work in dev and production');
test.todo('deleting the portfolio works');
