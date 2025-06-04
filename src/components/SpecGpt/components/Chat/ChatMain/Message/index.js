import { Flex, Image, Text, Skeleton, Container } from '@chakra-ui/react'
import React from 'react'
import SpecGptImage from "../../../../assets/spec-gpt.png"
import { MESSAGE_ROLE_TYPE } from '../../../../utils/enums';
import MessageSources from '../MessageSources';

const Message = ({ messageType, message, sources, isLoading }) => {
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
        const convertedText = convertUrlsToLinks(text);
        return (
            <div dangerouslySetInnerHTML={{ __html: convertedText }} />
        );
    };
    return (
        <Container borderRadius={6} maxW={"100%"} p={4} alignSelf={"center"} color={"gray.900"}>
            <Flex mb={2} gap={4}>
                <Flex align="center" justifyContent="center" w="24px" h="26px" borderRadius="8px">
                    <Image src={messageType === MESSAGE_ROLE_TYPE.USER ? "" : SpecGptImage} borderRadius="8px"></Image>
                </Flex>
                <Text mb={2} color="#676F74" fontWeight={"semibold"} fontSize={{ base: "14px", lg: "16px" }}>
                    {messageHeading}
                </Text>
            </Flex>
            <Text color={"gray.900"} whiteSpace={"pre-wrap"} ms={10}>
                {isLoading ? <Skeleton height={6} width={"100%"} /> :  TextWithLinks(message)}
            </Text>
            {sources !== undefined && !isLoading && (
                <MessageSources
                    sources={sources}
                />
            )}
        </Container>   
    )
}

export default Message