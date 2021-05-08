import {greet} from './greet';
import {aws_config} from './aws_export';
import {
	CognitoUserPool,
	CognitoUserAttribute,
	CognitoUser,
} from 'amazon-cognito-identity-js';

const userPool = new CognitoUserPool({
    UserPoolId: aws_config.userPoolId,
    ClientId: aws_config.clientId
})

const register = (registerRequest) => {
    userPool.signUp('rzielinski', '123456', [], null, (err, result) => {
        if(err){
            console.log(err);
            return;
        }
        console.log(result);
    });
}

const registerBtn = document.querySelector('button.registerUser');
registerBtn.addEventListener('click', () => {
    register({"name": "Radek", "xyz": "foo"});
});

(() => {
    greet("Radek :)")
})();