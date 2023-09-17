import { LeaderboardStat, UserStat } from './stats';
declare type LeaderboardResponse = {
    status: Number | Boolean;
    leaderboard: Array<LeaderboardStat> | null;
};
export declare const getLeaderboards: (authToken: string, serviceId: string, limit?: Number | undefined) => Promise<LeaderboardResponse>;
declare type UserStatResponse = {
    status: Number | Boolean;
    stat: UserStat | null;
};
export declare const getUserStat: (authToken: string, serviceId: string, cftools_id: string) => Promise<UserStatResponse>;
export {};
