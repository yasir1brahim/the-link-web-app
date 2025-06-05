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

const ERROR_MESSAGE = "I’m unable to answer that question, can you please restate? Try to make it more specific or narrower if possible."

const fetchPromptAnswer = async (userInput, k, chatSessionId, projectId, projectVersionId) => {
    try {
        const response = await axiosInstance({
            method: 'POST',
            url: `/api/deliverables/${projectId}/specgpt-chats/generate-response/`,
            data: {
                'user_input': userInput,
                'k': k,
                ...(projectVersionId ? {'project_version_id': projectVersionId} : {}),
                ...(chatSessionId ? {'chat_id': chatSessionId} : {}),
            },
        });
        if (!response.data) return {session_id: chatSessionId, questionid: '', role: MESSAGE_ROLE_TYPE.ERROR, message: ERROR_MESSAGE};
        if (response.status === 400) {
            // return 400 error
            const message = response.data.message;
            return {session_id: chatSessionId, questionid: '', role: MESSAGE_ROLE_TYPE.ERROR, message: message};
        }
        if (response.status === 500) {
            return {session_id: chatSessionId, questionid: '', role: MESSAGE_ROLE_TYPE.ERROR, message: ERROR_MESSAGE};
        }
        const answer = response.data.answer;
        const questionid = response.data.questionid;
        const sources = response.data.sources;
        const chatId = response.data.chat_id;
        console.log(sources);
        return {session_id: chatSessionId, chat_id: chatId, questionid: questionid, role: MESSAGE_ROLE_TYPE.ASSISTANT, message: answer, sources: sources};

    } catch (error) {
        console.log('Error: ', error);
        return {session_id: chatSessionId, questionid: '', role: MESSAGE_ROLE_TYPE.ERROR, message: ERROR_MESSAGE};
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
};