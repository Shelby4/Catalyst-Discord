import axios from 'axios'
import { AxiosRequestConfig } from 'axios'

import { LeaderboardStat, UserStat } from './stats'

type LeaderboardResponse = {
    status: Number | Boolean,
    leaderboard: Array<LeaderboardStat> | null
} 

export const getLeaderboards = 
( authToken:string, serviceId: string, limit?: Number): 
Promise<LeaderboardResponse> => {
    return new Promise<LeaderboardResponse>( (resolve, reject) => {

        let config:AxiosRequestConfig = 
        {
            headers: 
            {
                Authorization: `Bearer ${ authToken }`
            }
        }

        let url = `https://data.cftools.cloud/v1/server/${serviceId}/leaderboard?order=-1&stat=kills&limit=${limit || 9}`

        axios.get( url, config)
        .then( response => {
            var data = response.data

            var leaderboard:Array<LeaderboardStat> = []

            if ( data.leaderboard !== undefined 
                && Object.prototype.toString.call(data.leaderboard) === '[object Array]' )
            {
                data.leaderboard.forEach( ( stat:LeaderboardStat ) => {
                    leaderboard.push(stat)
                });
            }


            resolve({
                status: response.status,
                leaderboard
            })

        })
        .catch( response => {
            console.log( response )
            reject({
                status: response.status,
                leaderboard: null
            })
        })

    })
}

type UserStatResponse = {
    status: Number | Boolean,
    stat: UserStat | null
} 

export const getUserStat = 
( authToken:string, serviceId: string, cftools_id:string ):
Promise<UserStatResponse> => {
    return new Promise<UserStatResponse>(( resolve, reject ) => {

        const URL = `https://data.cftools.cloud/v1/server/${serviceId}/player?cftools_id=${cftools_id}`

        let config:AxiosRequestConfig = 
        {
            headers: 
            {
                Authorization: `Bearer ${ authToken }`
            }
        }

        axios.get(URL, config)
        .then( response => {
            var status = response.data.status;

            var userStat = response.data[ cftools_id ];
            var stat = userStat.game.general;
            var omegaStat = userStat.omega; 

            var responseStat:UserStat = {
                deaths: stat.deaths,
                hits: stat.hits,
                kdratio: stat.kdratio,
                kills: stat.kills,
                longest_kill: stat.longest_kill,
                longest_shot: stat.longest_shot,
                latest_name: omegaStat.name_history[omegaStat.name_history.length - 1],
                playtime: omegaStat.playtime
            }

            resolve({
                status: response.status,
                stat: responseStat
            })
        })
        .catch( response => {
            reject({
                status: response.status
            })
        })

    })
}