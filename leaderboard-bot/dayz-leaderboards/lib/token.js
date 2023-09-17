"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = void 0;
const axios_1 = require("axios");
const REFRESH_URL = `https://data.cftools.cloud/v1/auth/register`;
const refreshToken = (applicationId, secretKey) => {
    return new Promise((resolve, reject) => {
        if (applicationId === undefined || secretKey === undefined) {
            reject('error');
            return;
        }
        let credentials = {
            secret: secretKey,
            application_id: applicationId
        };
        axios_1.default.post(REFRESH_URL, credentials)
            .then((response) => {
            var newToken = response.data.token;
            resolve(newToken);
        })
            .catch((response) => {
            reject('error');
        });
    });
};
exports.refreshToken = refreshToken;
