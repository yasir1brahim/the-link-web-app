import { Flex, Image, Text, Skeleton, Container, SkeletonText } from '@chakra-ui/react'
import React from 'react'
import SpecGptImage from "../../../../assets/spec-gpt.png"
import { MESSAGE_ROLE_TYPE } from '../../../../utils/enums';
import MessageSources from '../MessageSources';
import { marked } from 'marked';


const Message = ({ messageType, message, sources, isLoading, projectId }) => {
    let messageHeading = "System"
    if (messageType === MESSAGE_ROLE_TYPE.USER) {
        messageHeading = "You"
    }
    if (messageType === MESSAGE_ROLE_TYPE.ASSISTANT) {
        messageHeading = "SpecGPT"
    }

    function convertUrlsToLinks(text) {
        const urlPattern = /(\bhttps?:\/\/[^\s/$.?#].[^\s]*)/gi;
        
        return text.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    }
    
    const TextWithLinks = (text) => {
        let markdownConvertedToHtml = '';
        if (!!text) {
            const convertedText = convertUrlsToLinks(text);
            marked.setOptions({
                tables: true,
                breaks: false,
                pedantic: false,
            });
            markdownConvertedToHtml = marked(convertedText);
        }
        return (
            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: markdownConvertedToHtml }} />
        );
    };
    return (
        <Container 
            borderRadius={6} 
            maxW={messageType === MESSAGE_ROLE_TYPE.USER ? "75%" : "100%"} 
            p={4} 
            backgroundColor={messageType === MESSAGE_ROLE_TYPE.USER ? "gray.100" : "white"}
            color={"gray.900"}
            ml={messageType === MESSAGE_ROLE_TYPE.USER ? "auto" : "0"}
            mr={messageType === MESSAGE_ROLE_TYPE.USER ? "0" : "auto"}
            mb="20px"
            >
            <Text color={"gray.900"} whiteSpace={"pre-wrap"} m={0}>
                {messageType === MESSAGE_ROLE_TYPE.USER ? (
                    <Text color={"gray.900"} whiteSpace={"pre-wrap"} m={0}>
                        {message}
                    </Text>
                ) : (
                    <SkeletonText isLoaded={!isLoading} noOfLines={4} skeletonHeight="20px" width={"100%"}>
                        {TextWithLinks(message)}
                    </SkeletonText>
                )}
            </Text>
            {!!sources && !isLoading && (
                <MessageSources
                    sources={sources}
                    projectId={projectId}
                />
            )}
        </Container>   
    )
}

export default Message