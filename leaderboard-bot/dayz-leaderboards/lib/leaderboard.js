"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStat = exports.getLeaderboards = void 0;
const axios_1 = require("axios");
const getLeaderboards = (authToken, serviceId, limit) => {
    return new Promise((resolve, reject) => {
        let config = {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        };
        let url = `https://data.cftools.cloud/v1/server/${serviceId}/leaderboard?order=-1&stat=kills&limit=${limit || 9}`;
        axios_1.default.get(url, config)
            .then(response => {
            var data = response.data;
            var leaderboard = [];
            if (data.leaderboard !== undefined
                && Object.prototype.toString.call(data.leaderboard) === '[object Array]') {
                data.leaderboard.forEach((stat) => {
                    leaderboard.push(stat);
                });
            }
            resolve({
                status: response.status,
                leaderboard
            });
        })
            .catch(response => {
            console.log(response);
            reject({
                status: response.status,
                leaderboard: null
            });
        });
    });
};
exports.getLeaderboards = getLeaderboards;
const getUserStat = (authToken, serviceId, cftools_id) => {
    return new Promise((resolve, reject) => {
        const URL = `https://data.cftools.cloud/v1/server/${serviceId}/player?cftools_id=${cftools_id}`;
        let config = {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        };
        axios_1.default.get(URL, config)
            .then(response => {
            var status = response.data.status;
            var userStat = response.data[cftools_id];
            var stat = userStat.game.general;
            var omegaStat = userStat.omega;
            var responseStat = {
                deaths: stat.deaths,
                hits: stat.hits,
                kdratio: stat.kdratio,
                kills: stat.kills,
                longest_kill: stat.longest_kill,
                longest_shot: stat.longest_shot,
                latest_name: omegaStat.name_history[0],
                playtime: omegaStat.playtime
            };
            resolve({
                status: response.status,
                stat: responseStat
            });
        })
            .catch(response => {
            reject({
                status: response.status
            });
        });
    });
};
exports.getUserStat = getUserStat;
