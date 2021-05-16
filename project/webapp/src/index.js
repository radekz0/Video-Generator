import {greet} from './greet';
import {aws_config} from './aws_export';
import AWS from 'aws-sdk';
import S3 from 'aws-sdk/clients/s3';
import  {CognitoIdentityCredentials} from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import {
	CognitoUserPool,
	CognitoUserAttribute,
	CognitoUser,
    AuthenticationDetails
} from 'amazon-cognito-identity-js';

AWS.config.region = aws_config.region;

const userPool = new CognitoUserPool({
    UserPoolId: aws_config.userPoolId,
    ClientId: aws_config.clientId
})


//Auth
const register = (registerRequest) => {
    return new Promise( (resolve, reject) => {
        const attirbuteList = [
            new CognitoUserAttribute({
                Name: 'website',
                Value: registerRequest.website
            })
        ]
        userPool.signUp(registerRequest.email, registerRequest.password, attirbuteList, null, (err, result) => {
            if(err){
                reject(err);
            }
            resolve(result);
        });
    });
}

const confirmAccount = (confirmRequest) => {
    return new Promise( (resolve, reject) => {
        const user = new CognitoUser({
            Username: confirmRequest.email,
            Pool: userPool
        }); 
        user.confirmRegistration(confirmRequest.code, true, (err, result) => {
            if(err){
                reject(err);
            }
            resolve(result);
        });
    });
}

const login = (loginRequest) => {
    return new Promise( (resolve, reject) => {
        const authenticationDetails = new AuthenticationDetails({
            Username: loginRequest.email,
            Password: loginRequest.password
        });
        const user = new CognitoUser({
            Username: loginRequest.email,
            Pool: userPool
        }); 
        user.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                resolve(result);
            },
            onFailure: (err) => {
                reject(err);
            }
        });
    })
}

const getCurrentUser = () => {
    return new Promise( (resolve, reject) => {
        const user = userPool.getCurrentUser(); 
        if(user == null){
            reject("User not found");
        }
        user.getSession( (err, session) => {
            if(err){
                reject(err);
            }

            user.getUserAttributes( (err, attributes) => {
                if(err){
                    reject(err);
                }

                const profile = attributes.reduce( (profile, item) => {
                    return {...profile, [item.Name]: item.Value}
                }, {});
                console.log(profile);
                resolve(profile);
            })
        })
    });
}

const getLocalStorageCredentials = () => {
    return new Promise( (resolve, reject) => {
        const user = userPool.getCurrentUser(); 
        if(user == null){
            reject("User not found");
        }
        user.getSession( (err, session) => {
            if(err){
                reject(err);
            }

            user.getSession( (err, session) => {
                if(err){
                    reject(err);
                }
                
                resolve(session);
            })
        })
    });
}

const refreshAWSCredentials = (tokenData) => {
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: aws_config.indentityPoolId,
        Logins: {
            [aws_config.credentialsLoginsKey]: tokenData
                .getIdToken()
                .getJwtToken(),
        },
    });
}

//Storage
const listFiles = () => {
    return new Promise( (resolve, reject) => {
        const s3 = new S3();

        s3.listObjectsV2({
            Bucket: aws_config.bucketName
        }, (err, data) => {
            if(err){
                reject(err);
            }
            resolve(data['Contents'].map(file => file.Key));
        })
    })
}

const uploadToS3 = (file, userId, onProgressChange) => {
    return new Promise( (resolve, reject) => {
        const s3 = new S3();
        const key = `uek-krakow/${userId}/filesFromUI/${uuidv4()}/${file.name}`;
        s3.putObject({
            Bucket: aws_config.bucketName,
            Key: key,
            Body: file
        }, (err, data) => {
            if(err){
                reject(err);
            }
            resolve(key);
        }).on('httpUploadProgress', (progress) => {
            const currentProgress = Math.round( (progress.loaded / progress.total) * 100);
            if(onProgressChange){
                onProgressChange(currentProgress);
            }
        });
    });
}

const getPreviewUrl = (key) => {
    const s3 = new S3();
    return s3.getSignedUrl('getObject', {
        Key: key,
        Bucket: aws_config.bucketName
    })
}

const registerBtn = document.getElementById('registerUser');
const registerRequestPayload = {
    email: "irj67553@eoopy.com",
    password: "1234abcd",
    website: "jkan.pl"
}
registerBtn.addEventListener('click', () => {
    register(registerRequestPayload)
        .then(result => console.log(result))
        .catch(error => console.log(error));
});

const confirmAccountBtn = document.getElementById('confirmUser');
const confirmAccountRequest = {
    code: '847260',
    email: registerRequestPayload.email
} 
confirmAccountBtn.addEventListener('click', () => {
    confirmAccount(confirmAccountRequest)
        .then(result => console.log(result))
        .catch(error => console.log(error));
});

const loginBtn = document.getElementById('loginUser');``
const loginRequestPayload = {
    email: registerRequestPayload.email,
    password: registerRequestPayload.password
};
loginBtn.addEventListener('click', () => {
    login(loginRequestPayload)
        .then(tokenData => refreshAWSCredentials(tokenData))
        .then(result => console.log(result))
        .catch(error => console.log(error));
});

const listFilesBtn = document.getElementById('listFiles');
listFilesBtn.addEventListener('click', () => {
    listFiles()
        .then(list => console.log(list))
        .catch(err => console.log('err'))
});

const uploadBtn = document.getElementById('upload-button');
uploadBtn.addEventListener('click', () => {
    const uploadInput = document.getElementById('upload-input');
    const progressBar = document.getElementById('progress-bar');
    const toBeUploadedFiles = [...uploadInput.files];
    if(toBeUploadedFiles.length == 0){
        alert('not enough files attached')
    }

    const userId = AWS.config.credentials.identityId;

    toBeUploadedFiles.forEach(file => {
        uploadToS3(file, userId, (currentProgress) => {
            progressBar.style.width = `${currentProgress}%`;
            progressBar.textContent = `Loading ... ${currentProgress} %`;
        })
            //.then(key => addToAnimationOrder(key))
            .then(key => getPreviewUrl(key))
            //.then(url => addToPreviewContainer(key))
            .then(url => console.log(url))
            //.finally(res => clearUploadState())
            .catch(err => console.log(err));

    })
});

(() => {  
    getLocalStorageCredentials()
        .then(tokenData => refreshAWSCredentials(tokenData))
        .catch(err => console.log(err));
    getCurrentUser()
        .then(profile => greet(profile.email))
        .catch(err => greet('Guest'));
})();