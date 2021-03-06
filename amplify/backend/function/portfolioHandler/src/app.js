/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

/* Amplify Params - DO NOT EDIT
	AUTH_REBALANCEC4A90FA9_USERPOOLID
	ENV
	REGION
	STORAGE_DYNAMO_ARN
	STORAGE_DYNAMO_NAME
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var bodyParser = require('body-parser')
var express = require('express')

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = "dynamo";
if(process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + '-' + process.env.ENV;
}

const path = "/portfolio";
// declare a new express app
var app = express()
app.use(bodyParser.text({type: "*/*"}));
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});


/*****************************************
 * HTTP Get method for get single object *
 *****************************************/

app.get(path, function(req, res) {
  let getItemParams = {
    TableName: tableName,
    Key: {
      user: req.apiGateway.event.requestContext.identity.cognitoIdentityId,
    }
  }

  dynamodb.get(getItemParams,(err, data) => {
    if(err) {
      res.statusCode = 500;
      res.json({error: 'Error: ' + err.message});
    } else {
      res.set('Content-Type','application/json');
      if(data.Item===undefined) {
        res.send([]);
      } else {
        res.send(data.Item.portfolio);
      }
    }
  });
});


/************************************
* HTTP put method for insert object *
*************************************/

app.put(path, function(req, res) {

  let putItemParams = {
    TableName: tableName,
    Item: {
      user: req.apiGateway.event.requestContext.identity.cognitoIdentityId,
      portfolio: req.body,
    },
  }
  dynamodb.put(putItemParams, (err, data) => {
    if(err) {
      res.statusCode = 500;
      res.json({error: err, url: req.url, body: req.body});
    } else{
      res.json({success: 'put call succeed!', url: req.url, data: data})
    }
  });
});



/**************************************
* HTTP remove method to delete object *
***************************************/

app.delete(path, function(req, res) {

  let removeItemParams = {
    TableName: tableName,
    Key: {
      user: req.apiGateway.event.requestContext.identity.cognitoIdentityId,
    }
  }
  dynamodb.delete(removeItemParams, (err, data)=> {
    if(err) {
      res.statusCode = 500;
      console.log('delete unsuccessful');
      console.log(err);
      res.json({error: err, url: req.url});
    } else {
      console.log('delete successful')
      res.json({url: req.url, data: data});
    }
  });
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
