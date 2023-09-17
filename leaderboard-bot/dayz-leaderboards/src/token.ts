import axios from 'axios'

const REFRESH_URL = `https://data.cftools.cloud/v1/auth/register`

export const refreshToken = 
(applicationId:string, secretKey: string): 
Promise<string> => {

    return new Promise<string>((resolve, reject) => {

        if ( applicationId === undefined || secretKey === undefined)
        {
            reject('error')
            return;
        }
        
        let credentials = 
        {
            secret: secretKey,
            application_id: applicationId
        }

        axios.post( REFRESH_URL, credentials )
        .then( ( response ) => {

            var newToken = response.data.token; 
            resolve(newToken)
        })
        .catch( ( response) => {

            reject('error')
        })

    })
}
