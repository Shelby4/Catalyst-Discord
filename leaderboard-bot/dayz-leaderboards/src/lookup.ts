import axios from 'axios'

type CFLookupResponse = {
    status: Number | Boolean,
    cftools_id: String | undefined
}

export const getCFId = 
( identifier:String ):
Promise<CFLookupResponse> => {
    return new Promise<CFLookupResponse>( (resolve, reject) => {
        
        const URL = `https://data.cftools.cloud/v1/users/lookup?identifier=${identifier}`

        axios.get( URL)
        .then( response => {

            var cftools_id:String = response.data.cftools_id

            resolve({
                status: response.status,
                cftools_id
            })
        })
        .catch( response => {
            reject({
                status: response.status
            })

        })
    })
}