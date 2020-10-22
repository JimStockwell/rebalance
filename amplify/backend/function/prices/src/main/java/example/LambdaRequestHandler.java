/* Amplify Params - DO NOT EDIT
	AUTH_REBALANCEC4A90FA9_USERPOOLID
	ENV
	REGION
	STORAGE_DYNAMO_ARN
	STORAGE_DYNAMO_NAME
Amplify Params - DO NOT EDIT */

package example;

import com.amazonaws.services.lambda.runtime.Context; 
import com.amazonaws.services.lambda.runtime.RequestHandler;

public class LambdaRequestHandler implements RequestHandler<RequestClass, ResponseClass>{   

    public ResponseClass handleRequest(RequestClass request, Context context){
        String greetingString = String.format("Hello %s %s!", request.firstName, request.lastName);
        return new ResponseClass(greetingString);
    }
}