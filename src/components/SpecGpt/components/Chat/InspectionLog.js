import React from 'react'
import { Box, Center, Heading, Spinner } from '@chakra-ui/react'
import Message from './ChatMain/Message';
import { MESSAGE_ROLE_TYPE } from '../../utils/enums';


const InspectionLog = ({ 
    inspectionLog, 
    projectId
}) => {

    return (
        <Box w="100%" maxW={"1200px"} h={"100%"} position={"relative"} pt={{ base: "20px", lg: "40px" }} marginX={"auto"}>
            {!inspectionLog && 
                <Center h={"100%"} w={"100%"} flexDirection={"column"} gap={5}>
                    <Spinner size="xl" color="#1F2A43" />
                </Center>
            }
            {inspectionLog &&
                <Box display={"block"} h={"calc(100% - 100px)"} w={"100%"} overflowY={"auto"}>
                    <Message 
                        messageType={MESSAGE_ROLE_TYPE.ASSISTANT}
                        message={inspectionLog} 
                        questionid={''} 
                        sources={[]}
                        projectId={projectId}
                        isLoading={false}
                    />
                </Box>
            }
        </Box>
    )
}

export default InspectionLog