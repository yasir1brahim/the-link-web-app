
const getBaseUrl = () => {
    // const dev = 'http://127.0.0.1:8000';
    const prod = 'https://api.specgpt.ai';
    const dev = 'https://api.specgpt.ai';
    console.log('NODE_ENV: ', process.env.NODE_ENV);
    return process.env.NODE_ENV === 'development' ? dev : prod;
}

export const BASE_URL = getBaseUrl();