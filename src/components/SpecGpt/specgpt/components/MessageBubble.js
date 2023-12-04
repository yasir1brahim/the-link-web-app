/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/config';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { icon } from '@fortawesome/fontawesome-svg-core/import.macro';
// import { RiWindowLine } from 'react-icons/ri';
import useLogout from '../utils/useLogout';
import { ReactComponent as Logo } from '../../../../assets/images/logo-dark.svg';
import { Grid } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import IconButton from '@mui/material/IconButton';
import { ReactComponent as PdfButton } from '../../../../assets/images/file-pdf.svg';

const messageContainerStyle = {
    color: 'rgba(52,53,65,1)',
    borderColor: 'red',
    borderBottom: '3px',
    width: '100%',
    backgroundColor: '#FFFFFF',
    marginTop: '16px'
}

const innerMessageContainerStyle = {
    paddingBottom: '1.5rem',
    paddingTop: '1.5rem',
    fontSize: '1rem',
    lineHeight: '1.5rem',
    marginLeft: '23%',
    marginRight: '23%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: '20px',
}

const sourceContainerStyle = {
    paddingBottom: '1.5rem',
    paddingTop: '1.5rem',
    fontSize: '1rem',
    lineHeight: '1.5rem',
    marginLeft: '23%',
    marginRight: '23%',
    gap: '20px',
}

const logoContainerStyle = {
    
    maxWidth: '30px',
    maxHeight: '30px',
}

const logoStyle = {
    width: '30px',
    height: '30px',
    backgroundColor: 'rgba(247,247,248,1)',
    marginTop: '2px',
}

const assistantMessageStyle = {    
}

const userMessageStyle = {
    backgroundColor: 'rgba(247,247,248,1)',
}

const systemMessageStyle = {
    backgroundColor: 'rgba(210,244,211,1)',
}

const errorMessageStyle = {
    backgroundColor: '#FF7276',
}


const SourcesComponent = ({sources, token}) => {
    const {checkIfLoggedOut} = useLogout();

    const fetchPdf = async (fileId) => {

        try {
            const response = await fetch(`${BASE_URL}/api/signed-url?id=${fileId}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + token,
                },
            });
            checkIfLoggedOut(response);
            const data = await response.json();
            if (data.success) {
                console.log('signed url', data.url);
                //setSignedUrl(data.url);
                window.open(data.url, '_blank');
            }
        } catch (error) {
            console.log('error: ', error);
        }            
    }

    const shorterFileName = (filename) => {
        const MAX_LENGTH = 50;
        // keep pdf extension in filename
        const extension = filename.split('.').pop();
        const filenameWithoutExtension = filename.substring(0, filename.length - extension.length - 1);
        if (filenameWithoutExtension.length > MAX_LENGTH) {
            return filenameWithoutExtension.substring(0, MAX_LENGTH) + '...' + extension;
        }
        return filename;
    }


    const renderSources = () => {
        return (
            <div className="flex-row" style={{maxWidth: '100%', fontSize: '12px'}}>
                {sources.map((source, index) => (               
                    <div key={index} className="col-8">
                        <PdfButton/>{'   '}
                        <a href={source?.link}
                        target="_blank"
                            // onClick={() => {
                            //     fetchPdf(source.docid);
                            // }}
                        >
                            {' '} {(source.filename)}
                        </a>
                    </div>
                ))}
            </div>
        )
    }
    return (
        <div style={sourceContainerStyle}>
            {sources.length > 0 && <div><strong>Source:</strong></div>}
            {sources.length > 0 && renderSources()}
        </div>
    )
}


const RatingComponent = ({questionid, token}) => {
    const [rating, setRating] = useState(0);
    const {checkIfLoggedOut} = useLogout();
    const baseURL = window.location.href.includes('https://app.thelink.ai')
      ? 'https://log-manager-api-prod.thelink.ai'
      : ' https://log-manager-api-dev.thelink.ai'
      const [searchParams] = useSearchParams();
      const projectDetails = searchParams.get('projectDetails')?.split(',');
      const projectId = projectDetails?.length
        ? JSON.parse(projectDetails[0])
        : null;

    const loadQuestionRating = async () => {
        const url = `${BASE_URL}/api/rating?question_id=${questionid}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + token,
            },
            });
            checkIfLoggedOut(response);
            const data = await response.json();
            if (data.success) {
                setRating(data.rating);
            }
        } catch (error) {
            console.log('error: ', error);
        }
    }

    const rateQuestion = async (rating) => {
        setRating(rating);
        const url = `${baseURL}/spec-gpt/question_rating`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + token,
                },
                body: {
                    question_id: questionid,
                    rating: rating,
                    project_id: projectId
                }
            });
            checkIfLoggedOut(response);
            const data = await response.json();
            if (data.success) {
                
            }
        } catch (error) {
            console.log('error: ', error);
        }
    }

    useEffect(() => {
        loadQuestionRating();
    }, [questionid]);


    const rateQuestionSubmit = (rating) => {
        rateQuestion(rating);
    }


    return (
        <>       
            {rating === 0 && (
                <>                    
                    {/* <FontAwesomeIcon 
                        icon={icon({name: 'thumbs-up', style: 'regular'})} 
                        onClick={() => rateQuestionSubmit(1)}
                        /> */}
                         <IconButton><ThumbUpAltOutlinedIcon fontSize="medium" onClick={() => rateQuestionSubmit(1)}/></IconButton>
                    <IconButton><ThumbDownAltOutlinedIcon fontSize="medium" onClick={() => rateQuestionSubmit(-1)}/></IconButton>
                    {/* <FontAwesomeIcon 
                        icon={icon({name: 'thumbs-down', style: 'regular'})} 
                        onClick={() => rateQuestionSubmit(-1)}
                    /> */}
                </>
            )}

            {rating === 1 && (
                <>
                    {/* <FontAwesomeIcon 
                        icon={icon({name: 'thumbs-up', style: 'solid'})} 
                        onClick={() => rateQuestionSubmit(0)}
                    /> */}
                    <IconButton><ThumbUpIcon fontSize="medium" onClick={() => rateQuestionSubmit(0)}/></IconButton>
                    <IconButton><ThumbDownAltOutlinedIcon fontSize="medium" onClick={() => rateQuestionSubmit(-1)}/></IconButton>
                    {/* <FontAwesomeIcon 
                        icon={icon({name: 'thumbs-down', style: 'regular'})} 
                        onClick={() => rateQuestionSubmit(-1)}
                    /> */}
                </>
            )}

            {rating === -1 && (
                <>
                    {/* <FontAwesomeIcon 
                        icon={icon({name: 'thumbs-up', style: 'regular'})} 
                        onClick={() => rateQuestionSubmit(1)}
                        /> */}
                        <ThumbUpAltOutlinedIcon fontSize="medium" onClick={() => rateQuestionSubmit(1)}/>
                    <ThumbDownIcon fontSize="medium" onClick={() => rateQuestionSubmit(0)}/>
                    {/* <FontAwesomeIcon 
                        icon={icon({name: 'thumbs-down', style: 'solid'})} 
                        onClick={() => rateQuestionSubmit(0)}
                    /> */}
                </>
            )} 
        </>
    );
}

const MessageBubble = ({message, textStyle, containerStyle, iconPath, questionid, token, sources}) => {
    
    return (
      <Grid item xs={12} style={containerStyle}>
        <div style={innerMessageContainerStyle}>
          <div style={logoContainerStyle}>
            {iconPath === 'link' ? (
              // <img src='../../../../assets/images/logo-dark-v7.svg' alt="logo" style={logoStyle} />:
              <span style={{ ...logoStyle, display: 'flex' }}>
                <Logo />
              </span>
            ) : (
              <span className="user-icon-spec">
                {localStorage.getItem('fullName')?.charAt(0) || (
                  <i className="fa fa-user"></i>
                )}
              </span>
            )}
          </div>

          <div style={textStyle}>
            <span dangerouslySetInnerHTML={{ __html: message }}></span>
          </div>
          {questionid !== undefined && (
            <RatingComponent questionid={questionid} token={token} />
          )}
        </div>
        {sources !== undefined && (
          <SourcesComponent sources={sources} token={token} />
        )}
      </Grid>
    );
}

export const AssistantMessageBubble = ({message, questionid, token, sources}) => {    
    const iconPath = 'link'
    return (
        <MessageBubble
            message={message}
            textStyle={assistantMessageStyle}
            containerStyle={messageContainerStyle}
            iconPath={iconPath}
            questionid={questionid}
            token={token}
            sources={sources}
        />
    )
}


export const WelcomeMessageBubble = ({message}) => {
    const iconPath = 'link'
    return (
        <MessageBubble
            message={message}
            textStyle={assistantMessageStyle}
            containerStyle={messageContainerStyle}
            iconPath={iconPath}
        />
    )
}


export const UserMessageBubble = ({message, rating}) => {
    const iconPath = 'self'
    return (
        <MessageBubble
            message={message}
            textStyle={userMessageStyle}
            containerStyle={{...messageContainerStyle, ...userMessageStyle}}
            iconPath={iconPath}
            rating={rating}
        />
    )
}


export const SystemMessageBubble = ({message}) => { 
    const iconPath = 'link'
    return (
        <MessageBubble
            message={message}
            textStyle={systemMessageStyle}
            containerStyle={systemMessageStyle}
            iconPath={iconPath}
        />
    )
}

export const ErrorMessageBubble = ({message}) => {
    const iconPath = 'link'
    return (
        <MessageBubble
            message={message}
            textStyle={errorMessageStyle}
            containerStyle={errorMessageStyle}
            iconPath={iconPath}
        />
    )
}