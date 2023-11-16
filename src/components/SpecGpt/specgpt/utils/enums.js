

export const DOC_TYPES = {
    REACT_DOCS : 'reactjs',
    DOCUMENTATION : 'documentation',
    GDOCS : 'gdocs',
    GFORMS: 'gforms',
    GSHEETS: 'gsheets',
    GSLIDES: 'gslides',
    GMAIL: 'gmail',
    WIKIPEDIA : 'wikipedia',
    EMPLOYEE : 'employee',
    SLACK: 'slack',
    STACKOVERFLOW : 'stackoverflow'
}

export const BASE_URL = () => {
    const dev = 'http://localhost:8000';
    const prod = 'https://likosapp.herokuapp.com';
    return process.env.NODE_ENV === 'prod' ? prod : dev;
}

export const MESSAGE_ROLE_TYPE = {
    USER: 'human',
    ASSISTANT: 'ai',
    SYSTEM: 'system',
    WELCOME_MESSAGE: 'welcome_message',
    ERROR: 'error',
}

export const CSS_VARS = {
    LIGHT_YELLOW: '#D5E93E',
    DARK_BLUE: '#202A44',
    WHITE: '#FFFFFF',
    TEXT_GRAY: '#8A8C8F',
}