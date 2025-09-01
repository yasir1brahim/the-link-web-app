import axiosInstance from "../../../config/axios";
import handleError from "../../../config/errorHandler";
import { MESSAGE_ROLE_TYPE } from "./enums";

const fetchPdf = async (projectId, s3Bucket, s3Key) => {
    try {
        const response = await axiosInstance({
            method: 'GET',
            url: `/api/deliverables/${projectId}/specgpt-chats/generate-presigned-url?s3_bucket=${s3Bucket}&s3_key=${s3Key}`,
        });
        console.log('signed url', response.data.url);
        return response.data.url
    } catch (error) {
        handleError(error);
        return null;
    }
}

const fetchChatHistory = async (projectId) => {
    try {
        const response = await axiosInstance({
            method: 'GET',
            url: `/api/deliverables/${projectId}/specgpt-chats/`,
        });
        return [...response.data.results];
    } catch (error) {
        handleError(error);
        return [];
    }   
}


const fetchChatSessionHistory = async (projectId, chatSessionID) => {
    try {
        const response = await axiosInstance({
            method: 'GET',
            url: `/api/deliverables/${projectId}/specgpt-chats/${chatSessionID}/`,
        });
        console.log("chat session history", response.data);
        return response.data.messages;
    } catch (error) {
        handleError(error);
        return [];
    }
}

const fetchInspectionLog = async (projectId, projectVersionId) => {
    return generateAiLog(projectId, projectVersionId, 'inspection_log');
}

const fetchOwnerDeliverablesLog = async (projectId, projectVersionId) => {
    return generateAiLog(projectId, projectVersionId, 'owner_deliverables_log');
}

// New functions for AI-generated logs
const fetchAiGeneratedLogs = async (projectId, projectVersionId, logType) => {
    try {
        const response = await axiosInstance({
            method: 'GET',
            url: `/api/deliverables/${projectId}/ai-generated-logs/`,
            params: {
                project_version_id: projectVersionId,
                log_type: logType
            }
        });
        return response.data.results;
    } catch (error) {
        handleError(error);
        return [];
    }
}

/**
 * Fetch AI generated log detail with optional sorting parameters
 * @param {string} projectId - Project ID
 * @param {string} logId - Log ID
 * @param {string} orderBy - Field to sort by (optional)
 * @param {string} order - Sort direction ('asc' or 'desc', default: 'desc')
 * @returns {Promise<Object|null>} Log detail data or null on error
 */
const fetchAiGeneratedLogDetail = async (projectId, logId, orderBy = null, order = 'desc') => {
    try {
        const params = {};
        if (orderBy) {
            params.order_by = orderBy;
            params.order = order;
        }
        
        const response = await axiosInstance({
            method: 'GET',
            url: `/api/deliverables/${projectId}/ai-generated-logs/${logId}/`,
            params: params
        });
        return response.data;
    } catch (error) {
        handleError(error);
        return null;
    }
}

/**
 * Fetch sorted log data with required sorting parameters
 * @param {string} projectId - Project ID
 * @param {string} logId - Log ID
 * @param {string} orderBy - Field to sort by
 * @param {string} order - Sort direction ('asc' or 'desc', default: 'desc')
 * @returns {Promise<Object|null>} Sorted log data or null on error
 */
const fetchSortedLogData = async (projectId, logId, orderBy, order = 'desc') => {
    try {
        if (!orderBy) {
            console.warn('fetchSortedLogData: orderBy parameter is required');
            return null;
        }
        
        const url = `/api/deliverables/${projectId}/ai-generated-logs/${logId}/`;
        const params = {
            order_by: orderBy,
            order: order
        };
        
        const response = await axiosInstance({
            method: 'GET',
            url: url,
            params: params
        });
        
        return response.data;
    } catch (error) {
        handleError(error);
        return null;
    }
}

const fetchMostRecentLog = async (projectId, projectVersionId, logType) => {
    try {
        const response = await axiosInstance({
            method: 'GET',
            url: `/api/deliverables/${projectId}/ai-generated-logs/`,
            params: {
                project_version_id: projectVersionId,
                log_type: logType,
                page: 1
            }
        });
        console.log('Most recent log:', response.data);
        // The backend orders by -created_at, so the first result is the most recent
        return response.data.results.length > 0 ? response.data.results[0] : null;
    } catch (error) {
        handleError(error);
        return null;
    }
}

const ERROR_MESSAGE = "I'm unable to answer that question, can you please restate? Try to make it more specific or narrower if possible."

const fetchPromptAnswer = async (userInput, k, chatSessionId, projectId, projectVersionId, responseType = 'standard') => {
    try {
        const response = await axiosInstance({
            method: 'POST',
            url: `/api/deliverables/${projectId}/specgpt-chats/generate-response/`,
            data: {
                'user_input': userInput,
                'k': k,
                'response_type': responseType,
                ...(projectVersionId ? {'project_version_id': projectVersionId} : {}),
                ...(chatSessionId ? {'chat_id': chatSessionId} : {}),
            },
        });
        if (response.data.error) {
            // return 400 error
            const message = response.data.error;
            return {session_id: chatSessionId, questionid: '', role: MESSAGE_ROLE_TYPE.ERROR, message: message};
        }
        if (!response.data) return {session_id: chatSessionId, questionid: '', role: MESSAGE_ROLE_TYPE.ERROR, message: ERROR_MESSAGE};
        console.log("newMessage response.data", response.data);
        const answer = response.data.answer;
        const questionid = response.data.questionid;
        const sources = response.data.sources;
        const chatId = response.data.chat_id;
        return {
            session_id: chatId, 
            chat_id: chatId, 
            questionid: questionid, 
            role: MESSAGE_ROLE_TYPE.ASSISTANT, 
            message: answer, 
            sources: sources, 
            max_chat_messages: response.data.max_chat_messages
        };

    } catch (error) {
        console.log('Error: ', error);
        return {session_id: chatSessionId, questionid: '', role: MESSAGE_ROLE_TYPE.ERROR, message: ERROR_MESSAGE};
    }
}


const generateAiLog = async (projectId, projectVersionId, logType) => {
    try {
        const response = await axiosInstance({
            method: 'POST',
            url: `/api/deliverables/${projectId}/specgpt-chats/generate-ai-log/`,
            data: {
                'project_id': projectId,
                'project_version_id': projectVersionId,
                'log_type': logType,
            },
        });
        return response.data;
    } catch (error) {
        console.log('Error: ', error);
        return null;
    }
}

const extractTablesToExcel = async (projectId, text) => {
    try {
        const response = await axiosInstance({
            method: 'POST',
            url: `/api/deliverables/${projectId}/specgpt-chats/extract-tables-to-csv/`,
            data: {
                'text': text,
                'extract_all': true,
            },
            responseType: 'blob', // Important for file downloads
        });

        return response;
    } catch (error) {
        if (error.response.status === 422) {
            return { success: false, errorType: 'no_tables', error: error.response.data.error };
        }
        console.log('Error extracting tables: ', error);
        return { success: false, error: error.message };
    }
}

const countUserDocs = async (token) => {
    try {
        const response = await axiosInstance({
            method: 'GET',
            url: `/api/doc-count`,
        });
        if (response.data.success) {
            return response.data.count;
        }
    } catch (error) {
        handleError(error);
        return null;
    }
    return null;
}


const ProcessingStatus = {
    IN_QUEUE: 'IN_QUEUE',
    PROCESSING: 'PROCESSING',
    PROCESSED: 'PROCESSED',
    FAILED: 'FAILED',
}

const loadUserDocs = async () => {
    try {
        const response = await axiosInstance({
            method: 'GET',
            url: `/api/docs`,
        });
        if (response.data.success) {
            return response.data.docs;
        }            
    } catch (error) {
        handleError(error);
        return [];
    }
    return [];
}


export {
    fetchPdf,
    fetchChatHistory,
    fetchChatSessionHistory,
    fetchPromptAnswer,
    countUserDocs,
    ProcessingStatus,
    loadUserDocs,
    fetchInspectionLog,
    fetchOwnerDeliverablesLog,
    fetchAiGeneratedLogs,
    fetchAiGeneratedLogDetail,
    fetchSortedLogData,
    fetchMostRecentLog,
    extractTablesToExcel,
    generateAiLog,
};