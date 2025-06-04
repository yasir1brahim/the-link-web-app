import { Box } from '@chakra-ui/react'
import React from 'react'
import Header from './Header'

const Layout = ({children}) => {
  return (
      <Box w="100%" >
          <Header />
          <Box>
              {children}
          </Box>
    </Box>
  )
}

export default Layout