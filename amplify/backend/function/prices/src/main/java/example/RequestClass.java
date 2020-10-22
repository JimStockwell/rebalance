/* Amplify Params - DO NOT EDIT
	AUTH_REBALANCEC4A90FA9_USERPOOLID
	ENV
	REGION
	STORAGE_DYNAMO_ARN
	STORAGE_DYNAMO_NAME
Amplify Params - DO NOT EDIT */

package example;
        
     public class RequestClass {
        String firstName;
        String lastName;

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public RequestClass(String firstName, String lastName) {
            this.firstName = firstName;
            this.lastName = lastName;
        }

        public RequestClass() {
        }
    }