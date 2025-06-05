import React from 'react'
import { Flex, Spinner } from '@chakra-ui/react'

export const LoadingPage = () => {
    return (
        <Flex height={'100vh'} justifyContent={'center'} alignItems={'center'}>
            <Spinner />
        </Flex>
    )
}
