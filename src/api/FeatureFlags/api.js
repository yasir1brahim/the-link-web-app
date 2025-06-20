import axiosInstance from "../../config/axios";
import handleError from "../../config/errorHandler";

import { getCurrentUserData, getTeamDetails } from "../Authentication/api";
import { 
    NOTICES_FEATURE_FLAG_NAME, 
    VERSIONING_FEATURE_FLAG_NAME, 
    VERSION_COMPARISON_FEATURE_FLAG_NAME,
    VERSION_COMPARISON_SEARCH_FEATURE_FLAG_NAME,
    FULL_SPEC_PROCESSING_FEATURE_FLAG_NAME,
    SPEC_GPT_FEATURE_FLAG_NAME,
    INSPECTION_LOG_FEATURE_FLAG_NAME
} from "../../constants";


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

const isFullSpecProcessingFlagActive = async (teamId) => {
    const activeFlagsForTeam = await getActiveFlagsForTeam(teamId);
    console.log('activeFlagsForTeam', activeFlagsForTeam);
    const activeFlagsForUser = await getActiveFlagsForUser();
    console.log('activeFlagsForUser', activeFlagsForUser);
    return activeFlagsForTeam.includes(FULL_SPEC_PROCESSING_FEATURE_FLAG_NAME) || activeFlagsForUser.includes(FULL_SPEC_PROCESSING_FEATURE_FLAG_NAME);
}

const isVersioningFlagActive = async (teamId) => {
    const activeFlagsForTeam = await getActiveFlagsForTeam(teamId);
    console.log('activeFlagsForTeam', activeFlagsForTeam);
    const activeFlagsForUser = await getActiveFlagsForUser();
    console.log('activeFlagsForUser', activeFlagsForUser);
    return activeFlagsForTeam.includes(VERSIONING_FEATURE_FLAG_NAME) || activeFlagsForUser.includes(VERSIONING_FEATURE_FLAG_NAME);
}

const isVersionComparisonFlagActive = async (teamId) => {
    const activeFlagsForTeam = await getActiveFlagsForTeam(teamId);
    console.log('activeFlagsForTeam', activeFlagsForTeam);
    const activeFlagsForUser = await getActiveFlagsForUser();
    console.log('activeFlagsForUser', activeFlagsForUser);
    return activeFlagsForTeam.includes(VERSION_COMPARISON_FEATURE_FLAG_NAME) || activeFlagsForUser.includes(VERSION_COMPARISON_FEATURE_FLAG_NAME);
}

const isVersionComparisonSearchFlagActive = async (teamId) => {
    const activeFlagsForTeam = await getActiveFlagsForTeam(teamId);
    console.log('activeFlagsForTeam', activeFlagsForTeam);
    const activeFlagsForUser = await getActiveFlagsForUser();
    console.log('activeFlagsForUser', activeFlagsForUser);
    return activeFlagsForTeam.includes(VERSION_COMPARISON_SEARCH_FEATURE_FLAG_NAME) || activeFlagsForUser.includes(VERSION_COMPARISON_SEARCH_FEATURE_FLAG_NAME);
}

const isSpecGptFlagActive = async (teamId) => {
    const activeFlagsForTeam = await getActiveFlagsForTeam(teamId);
    console.log('activeFlagsForTeam', activeFlagsForTeam);
    const activeFlagsForUser = await getActiveFlagsForUser();
    console.log('activeFlagsForUser', activeFlagsForUser);
    return activeFlagsForTeam.includes(SPEC_GPT_FEATURE_FLAG_NAME) || activeFlagsForUser.includes(SPEC_GPT_FEATURE_FLAG_NAME);
}

const isInspectionLogFlagActive = async (teamId) => {
    const activeFlagsForTeam = await getActiveFlagsForTeam(teamId);
    console.log('activeFlagsForTeam', activeFlagsForTeam);
    const activeFlagsForUser = await getActiveFlagsForUser();
    console.log('activeFlagsForUser', activeFlagsForUser);
    return activeFlagsForTeam.includes(INSPECTION_LOG_FEATURE_FLAG_NAME) || activeFlagsForUser.includes(INSPECTION_LOG_FEATURE_FLAG_NAME);
}

export {
    listFeatureFlags,
    getActiveFlagsForUser,
    getActiveFlagsForTeam,
    isNoticesFlagActive,
    isVersioningFlagActive,
    isVersionComparisonFlagActive,
    isVersionComparisonSearchFlagActive,
    isFullSpecProcessingFlagActive,
    isSpecGptFlagActive,
    isInspectionLogFlagActive
}