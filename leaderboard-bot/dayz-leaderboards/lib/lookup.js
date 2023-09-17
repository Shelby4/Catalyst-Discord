"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCFId = void 0;
const axios_1 = require("axios");
const getCFId = (identifier) => {
    return new Promise((resolve, reject) => {
        const URL = `https://data.cftools.cloud/v1/users/lookup?identifier=${identifier}`;
        axios_1.default.get(URL)
            .then(response => {
            var cftools_id = response.data.cftools_id;
            resolve({
                status: response.status,
                cftools_id
            });
        })
            .catch(response => {
            reject({
                status: response.status
            });
        });
    });
};
exports.getCFId = getCFId;
