/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { BASE_URL } from '../utils/config';
// import Form from 'react-bootstrap/Form';
import { CSS_VARS, MESSAGE_ROLE_TYPE } from '../utils/enums';
import {
  AssistantMessageBubble,
  UserMessageBubble,
  WelcomeMessageBubble,
  SystemMessageBubble,
  ErrorMessageBubble
} from '../components/MessageBubble';
// import Select from 'react-select';
import { Modal } from 'reactstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
// import Header from '../components/Header';
import { v4 as uuidv4 } from 'uuid';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { icon, solid, regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import useLogout from '../utils/useLogout';
import Loader from '../../../shared/Loader/Loader';
import MicIcon from '@mui/icons-material/Mic';
import MicNoneIcon from '@mui/icons-material/MicNone';
import SubmitButton from '@mui/icons-material/East';
import { Typography, Box, Link, Grid  } from '@mui/material';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import IconButton from '@mui/material/IconButton';
// import axiosInstance from '../../../../config/axios';

// new ones
const pageContainerStyle2 = {
  // height: '100vh',
  backgroundColor: '#c5c5d2',
  overlfow: 'hidden',
};

// const leftPanelStyle2 = {
//   backgroundColor: 'rgb(31, 42, 67)',
//   width: '15vw',
//   minWidth: '200px',
//   padding: '1%',
//   color: '#FFFFFF',
//   paddingRight: '0'
// };

const rightPanelStyle2 = {
  backgroundColor: '#FFFFFF',
  // width: '85vw',
  // height: '100vh',
  overlfow: 'hidden'
};

const preQuestionStyle = {
  textAlign: 'center',
  height: '55vh',
  width: '90%',
  // marginTop: '17px',
  display: 'flex',
  flexDirection: 'row'
};

const chatInputStyle2 = {
  backgroundColor: '#FFFFFF',
  height: '15vh',
  paddingTop: '1%'
};

const inputStyle2 = {
  width: '50%',
  marginTop: '1%',
  boxShadow:
    '0 0 transparent, 0 0 transparent , 0 0 transparent, 0 0 transparent, 0 0 15px rgba(0,0,0,.1)',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  height: '50px'
};

const userInputTextAreaStyle2 = {
  width: '88%',
  resize: 'none',
  border: 'none',
  outline: 'none',
};

const formInputStyle = {
  display: 'flex',
  alignItems: 'center'
};

// const quickQuestionStyle = {
//   padding: '5px',
//   border: '1px solid',
//   marginBottom: '10px',
//   cursor: 'pointer'
// };

const voiceCommandText = {
    width: '14%',
    marginLeft: '9%'
};

const ChatPage = ({ token, docsLoaded }) => {
  const navigate = useNavigate();
  const { checkIfLoggedOut } = useLogout();

  const testMessages = [
    //{'role': MESSAGE_ROLE_TYPE.WELCOME_MESSAGE, 'message': 'Welcome to the chatbot! How can I help you today?'}
  ];

  const [promptArea, setPromptArea] = useState('');
  const [promptMessage, setPromptMessage] = useState('');
  const [messages, setMessages] = useState(testMessages);
  // const [k, setK] = useState(21);
  // const [docCount, setDocCount] = useState(0);
  const [showPurgeFilesModal, setShowPurgeFilesModal] = useState(false);
  const [showPurgingSpinnerModal, setShowPurgingSpinnerModal] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(uuidv4());
  // const [chatHistory, setChatHistory] = useState([]);
  // const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const projectDetails = searchParams.get('projectDetails')?.split(',');
  const projectId = projectDetails?.length
    ? JSON.parse(projectDetails[0])
    : null;

  const promptAreaRef = useRef(null);
  const baseURL = window.location.href.includes('https://app.thelink.ai')
      ? 'https://log-manager-api-prod.thelink.ai'
      : ' https://log-manager-api-dev.thelink.ai'
  const sessionid = searchParams.get('sessionId')
  const [isLoading, setLoading] = useState(false);
  

  useEffect(() => {
    if (promptAreaRef.current.style != null) {
      promptAreaRef.current.style.height = 'auto';
      promptAreaRef.current.style.height = `${promptAreaRef.current.scrollHeight}px`;
    }
    promptAreaRef.current.style.height = 'auto';
    promptAreaRef.current.style.height = `${promptAreaRef.current.scrollHeight}px`;
  }, [promptArea]);

  // const fetchChatHistory = async () => {
  //   const url = `${baseURL}/spec-gpt/chat_history`;
  //   try {
  //     const response = await fetch(url, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: 'Bearer ' + localStorage.getItem('token')
  //       }
  //     });
  //     checkIfLoggedOut(response);
  //     const data = await response.json();
  //     if (data.success) {
  //       setChatHistory([...data.chat_history]);
  //       console.log(data);
  //     }
  //   } catch (error) {
  //     console.log('Error: ', error);
  //   }
  // };

  const fetchChatSessionHistory = async (chatSessionID) => {
    const url = `${baseURL}/spec-gpt/chat_session_history?chat_session_id=${sessionid || chatSessionID}`;
    try {
      setLoading(true)
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      });
      checkIfLoggedOut(response);
      const data = await response.json();
      if (data.success) {
        let messageHistory = [];
        for (let i = 0; i < data.chat_history.length; i++) {
          messageHistory.push({
            questionid: data.chat_history[i].questionid,
            role: data.chat_history[i].role,
            message: data.chat_history[i].message
          });
          setMessages([...messageHistory]);
        }
        setChatSessionId(chatSessionID);
      setLoading(false);

      }
    } catch (error) {
      console.log('Error: ', error);
      setLoading(false);

    }
  };

  useEffect(() => {
    // fetchChatHistory();
    fetchChatSessionHistory(chatSessionId)
  }, []);

  const countUserDocs = async () => {
    const url = `${BASE_URL}/api/doc-count`;
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        }
      });
      checkIfLoggedOut(response);
      const data = await response.json();
      if (data.success) {
        // setDocCount(data.count);
      }
    } catch (error) {
      console.log('Error: ', error);
    }
  };

  const purgeFiles = async () => {
    const url = `${BASE_URL}/api/purge-files`;
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        }
      });
      checkIfLoggedOut(response);
      const data = await response.json();
      if (data.success) {
        countUserDocs();
        setShowPurgingSpinnerModal(false);
        navigate('/getting-started');
      }
    } catch (error) {
      console.log('Error: ', error);
    }
  };

  // const scrollToDivRef = useRef(null);
  // useEffect(() => {
  //   scrollToDivRef.current.scrollIntoView({ behavior: 'instant' });
  // }, [messages]);

  useEffect(() => {
    const fetchPromptAnswer = async (prompt) => {
      const url = `${baseURL}/spec-gpt/chat_stream`;
      try {
        setLoading(true)
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('token')
          },
          body: JSON.stringify({
            prompt: prompt,
            project_id: projectId,
            chat_session_id: chatSessionId
          })
        });
        setLoading(false)
        checkIfLoggedOut(response);
        if (!response.body) return;
        if (response.status === 400) {
          // return 400 error
          const data = await response.json();
          const message = data.message;
          setMessages([
            ...messages,
            { role: MESSAGE_ROLE_TYPE.ERROR, message: message }
          ]);
          return;
        }
        if (response.status === 500) {
          setMessages([
            ...messages,
            {
              role: MESSAGE_ROLE_TYPE.ERROR,
              message:
                'There was an error in the system. Please contact support.'
            }
          ]);
          return;
        }
        const data = await response.json();
        const answer = data.answer;
        const questionid = data.questionid;
        const sources = data.sources;
        setMessages([
          ...messages,
          {
            role: MESSAGE_ROLE_TYPE.ASSISTANT,
            message: answer,
            questionid: questionid,
            sources: sources
          }
        ]);
        // scrollToDivRef.current.scrollIntoView({ behavior: 'smooth' });
      } catch (error) {
        console.log('Error: ', error);
      }
    };

    if (promptMessage) {
      fetchPromptAnswer(promptMessage);
      setPromptMessage('');
    }
  }, [promptMessage]);

  const submitMessage = () => {
    console.log('Submit message: ', promptArea);
    const promptMessage = promptArea;
    setMessages([
      ...messages,
      { role: MESSAGE_ROLE_TYPE.USER, message: promptArea }
    ]);
    // scrollToDivRef.current.scrollIntoView({ behavior: 'smooth' });
    setPromptArea('');
    setPromptMessage(promptMessage);
  };

  const submitMessageInline = (micMessage) => {
    if (!micMessage) return;
    console.log('Submit message: ', micMessage);
    const promptMessage = micMessage;
    setMessages([
      ...messages,
      { role: MESSAGE_ROLE_TYPE.USER, message: promptMessage }
    ]);
    // scrollToDivRef.current.scrollIntoView({ behavior: 'smooth' });
    setPromptArea('');
    setPromptMessage(promptMessage);
  };

  const handleMicrophoneClick = () => {
    console.log('handleMicrophoneClick');
    if (isListening) {
      handleStop();
    } else {
      handleStart();
    }
  };

  const handleStart = () => {
    window.SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new window.SpeechRecognition();

    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join('');

      // setTranscript(text);
      setPromptArea(text);

      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => handleStop(text), 1500); // 2.5 seconds
    };

    recognitionRef.current.start();
    setIsListening(true);
  };

  let handleStop = (finalTranscript) => {
    submitMessageInline(finalTranscript);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    clearTimeout(timeoutRef.current);

    setIsListening(false);
  };

  const purgingSpinnerModal = () => {
    return (
      <Modal
        show={showPurgingSpinnerModal}
        onHide={() => setShowPurgingSpinnerModal(true)}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Body>
          <div style={{ textAlign: 'center' }}>
            <Loader />
            <div style={{ marginTop: '5%' }}>Purging files...</div>
          </div>
        </Modal.Body>
      </Modal>
    );
  };

  const purgeFilesConfirmModal = () => {
    return (
      <Modal
        show={showPurgeFilesModal}
        onHide={() => setShowPurgeFilesModal(false)}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Body>
          <div style={{ textAlign: 'center', marginTop: '5%' }}>
            <div style={{ marginTop: '5%' }}>
              Are you sure you want to delete all your docs?
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '5%' }}>
            <button
              className="btn btn-danger"
              onClick={() => setShowPurgeFilesModal(false)}
            >
              Cancel
            </button>
            <button
              style={{ marginLeft: '5%' }}
              className="btn btn-primary"
              onClick={() => {
                setShowPurgingSpinnerModal(true);
                setShowPurgeFilesModal(false);
                purgeFiles();
              }}
            >
              Delete
            </button>
          </div>
        </Modal.Body>
      </Modal>
    );
  };

  // const gotoUploadPage = () => {
  //   navigate('/uploaded-files');
  // };

  const PromptBox = () => {
    return (
      <div style={chatInputStyle2}>
        <form style={formInputStyle}>
          <Typography style={voiceCommandText}>
            Try the voice icon to dictate questions!
          </Typography>
          <div style={inputStyle2}>
            <IconButton onClick={handleMicrophoneClick}>
              {isListening ? (
                <MicIcon fontSize="medium" />
              ) : (
                <MicNoneIcon fontSize="medium" />
              )}
            </IconButton>
            <TextareaAutosize
              ref={promptAreaRef}
              value={promptArea}
              onChange={(e) => setPromptArea(e.target.value)}
              placeholder="Enter your question here..."
              rowsMin={1}
              maxRows={4}
              style={userInputTextAreaStyle2}
              onKeyDown={(e) => {
                const keyCode = e.keyCode;
                if (keyCode === 13) {
                  e.preventDefault();
                  submitMessage();
                }
              }}
            />
            <IconButton onClick={submitMessage}>
              <SubmitButton fontSize="medium" />
            </IconButton>
          </div>
        </form>
        <Box
          sx={{
            float: 'right'
          }}
        >
          For help email{' '}
          <Link href="mailto:support@thelink.ai" target="_blank">
            support@thelink.ai
          </Link>
        </Box>
      </div>
    );
  };

  const ExampleQuestionBubble = ({ text }) => {
    return (
      <Box
      className="example-question-text bg-gray"
      sx={{
        padding: '10%',
        border: '0px',
        borderRadius: '10px',
        marginTop: '5%',
        color: CSS_VARS.DARK_BLUE,
      }}
    >
      <Typography variant="body1" align="center">
        {text}
      </Typography>
    </Box>
    );
  };

  const ClickableExampleQuestionBubble = ({ text }) => {
    return (
      <Box
      component="div"
      className="clickable-example-question-title bg-gray"
      sx={{
        padding: '5%',
        borderRadius: '10px',
        marginTop: '5%',
        color: '#202A44',
        '&:hover': {
          cursor: 'pointer',
          backgroundColor: '#D5E93E',
        },
        '@media (max-width: 900px)': {
          overflow: 'auto',
        },
      }}
      onClick={() => {
            const projectDetails = searchParams.get('projectDetails')
            setPromptArea(text);
            submitMessageInline(text);
            // searchParams.set('sessionId', JSON.stringify(chatSessionId))
            setSearchParams({projectDetails, sessionId: chatSessionId})
          }}
    >
      <Typography variant="body1" align="center" sx={{ fontSize: '16px', letterSpacing: '0%' }}>
        {text}
      </Typography>
    </Box>
    );
  };

  const PreQuestion = () => {
    return (
     <Grid container spacing={2} style={preQuestionStyle} sx={{'@media (max-width: 900px)': {
      flexDirection: 'column'
    },}}>
      <Grid item sm={12}  md={6}>
        <Typography variant="h4">Some Example Questions</Typography>
        <Typography variant="subtitle1">(You can just click these to try them out)</Typography>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <ClickableExampleQuestionBubble text="What are the weather parameters to consider when pouring concrete?" />
            <ClickableExampleQuestionBubble text="What concrete tests are required?" />
            <ClickableExampleQuestionBubble text="What kind of quality control measures are required on this project?" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <ClickableExampleQuestionBubble text="What submittals are required for cast in place concrete?" />
            <ClickableExampleQuestionBubble text="Please bullet out the ASTM standards referenced in this spec?" />
          </Grid>
        </Grid>
      </Grid>
      <Grid item sm={12} md={6}>
        <Typography variant="h4">Some Capabilities of SpecGPT</Typography>
        <div style={{ textAlign: 'center', color: 'white' }}>.</div>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <ExampleQuestionBubble text="Ask questions" />
            <ExampleQuestionBubble text="Ask for responses in a table" />
            <ExampleQuestionBubble text="Provide an example of how you want the answer" />
            {/* <ExampleQuestionBubble text="Fully encrypted system, data deleted weekly" /> */}
          </Grid>
          <Grid item xs={12} sm={6}>
            <ExampleQuestionBubble text="Ask up to eight follow up questions" />
            <ExampleQuestionBubble text="Ask for responses in bulleted form" />
            {/* <ExampleQuestionBubble text="Rate the answer" /> */}
            <ExampleQuestionBubble text="Use voice inputs to ask your questions" />
          </Grid>
        </Grid> 
      </Grid>
    </Grid>
    );
  };

  if (!docsLoaded) return <Loader showComponentLoader={true} specGptLoader={true}/>
  return (
    <>
      <div style={pageContainerStyle2}>
          {/* <div style={leftPanelStyle2}>

                        <div>
                            <div className="mb-3 mt-2 text-center">
                                <img src={'./images/The_Link_White_cropped.png'} height="50px" width="50px" />
                            </div>
                            <div className="text-center">
                                <button
                                    onClick={() => {
                                        navigate('/getting-started');
                                    }}
                                    className="btn"
                                    style={{backgroundColor: CSS_VARS.LIGHT_YELLOW, color: CSS_VARS.DARK_BLUE}}
                                    >+ Add Documents
                                </button>
                            </div>
                            <div className="mt-3 text-center">
                                <button
                                    onClick={gotoUploadPage}
                                    className="btn"
                                    style={{backgroundColor: CSS_VARS.TEXT_GRAY, color: CSS_VARS.LIGHT_YELLOW}}
                                    >
                                View uploaded documents
                                </button>
                            </div>
                            
                            <div className="mt-3 mb-5" style={{maxHeight: '70vh', overflow: 'auto'}}>                                
                                <p className="color-text-gray">Previous 30 days</p>
                                {chatHistory.map((chat, index) => {
                                    return (
                                                <div
                                                    onClick={() => {
                                                        fetchChatSessionHistory(chat.session_id);
                                                    }} 
                                                    className="color-text-gray"
                                                    style={{cursor: 'pointer'}}
                                                    key={index}>
                                                        <span>
                                                            <FontAwesomeIcon icon={regular("comment-dots")} style={{color: "#b4b8c0",}} />
                                                        </span>
                                                        <span>{' '} {chat.question}</span>
                                                </div>
                                            )
                                })}
                                <div className="mt-5 mb-5 pt-5"> </div>
                            </div>
                            <div className="text-center mt-2" style={{position: 'fixed', bottom: '10px', left: '3%'}}>
                                <button
                                    onClick={setShowPurgeFilesModal}
                                    className="btn btn-danger mt-2"
                                    >
                                        Delete all Data
                                </button>
                            </div>

                        </div>
                    </div> */}

              <Grid container spacing={2} style={rightPanelStyle2}>
              {/* <div className="mb-3">
                            <div className="text-center specgpt-logo-title">
                                SpecGPT
                            </div>
                            <div className="beta-v1-text">
                                Beta V1                        
                            </div>
                            </div> */}
              {messages.length === 0 && <Grid item xs={12} md={12} style={{ display: 'flex', justifyContent: 'center'}}>{PreQuestion()}</Grid>}
              <>
                {messages.map((message, index) => {
                  if (message.role === MESSAGE_ROLE_TYPE.ASSISTANT) {
                    return (
                      <AssistantMessageBubble
                        key={index}
                        message={message.message}
                        questionid={message.questionid}
                        token={token}
                        sources={message.sources}
                      />
                    );
                  } else if (
                    message.role === MESSAGE_ROLE_TYPE.WELCOME_MESSAGE
                  ) {
                    return (
                      <WelcomeMessageBubble
                        key={index}
                        message={message.message}
                      />
                    );
                  } else if (message.role === MESSAGE_ROLE_TYPE.SYSTEM) {
                    return (
                      <SystemMessageBubble
                        key={index}
                        message={message.message}
                      />
                    );
                  } else if (message.role === MESSAGE_ROLE_TYPE.ERROR) {
                    return (
                      <ErrorMessageBubble
                        key={index}
                        message={message.message}
                      />
                    );
                  } else {
                    return (
                      <UserMessageBubble
                        key={index}
                        message={message.message}
                      />
                    );
                  }
                })}
              </>
              {/* <Grid item xs={12} style={{ marginBottom: '50px' }} ref={scrollToDivRef}></Grid> */}
            {<Grid item xs={12} md={12}>{PromptBox()}</Grid>}
          </Grid>
          <Loader showComponentLoader={isLoading} />
      </div>
      {purgeFilesConfirmModal()}
      {purgingSpinnerModal()}
    </>
  );
};

export default ChatPage;
