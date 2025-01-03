import axiosInstance from "../../config/axios";
import handleError from "../../config/errorHandler";

import { getCurrentUserData, getTeamDetails } from "../Authentication/api";
import { NOTICES_FEATURE_FLAG_NAME } from "../../constants";


const listFeatureFlags = async () => {
    try {
        return await axiosInstance({
            method: 'get',
            url: `/waffle/waffle_status`,
        });
    } catch (error) {
        handleError(error);
    }
}

const getActiveFlagsForUser = async () => {
    const user = await getCurrentUserData();
    return user.data.active_flags;
}

const getActiveFlagsForTeam = async (teamId) => {
    const team = await getTeamDetails(teamId);
    return team.data.active_flags;
}

const isNoticesFlagActive = async (teamId) => {
    const activeFlagsForTeam = await getActiveFlagsForTeam(teamId);
    console.log('activeFlagsForTeam', activeFlagsForTeam);
    const activeFlagsForUser = await getActiveFlagsForUser();
    console.log('activeFlagsForUser', activeFlagsForUser);
    return activeFlagsForTeam.includes(NOTICES_FEATURE_FLAG_NAME) || activeFlagsForUser.includes(NOTICES_FEATURE_FLAG_NAME);
}


export {
    listFeatureFlags,
    getActiveFlagsForUser,
    getActiveFlagsForTeam,
    isNoticesFlagActive
}