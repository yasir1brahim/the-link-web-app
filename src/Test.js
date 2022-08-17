import PdfReader from './components/PdfReader'
import { useLocation } from 'react-router-dom';


import React from 'react'
const Test = () => {
  const {query} = useLocation()
  console.log('loc', query)
  return (
    
    <div>
        {/* <PdfReader url={`https://linkdocs.s3.amazonaws.com/original/project_10_05_5000_-_METAL_FABRICATIONS.pdf`}/> */}
        {/* <PdfReader url={location.state?.url || ''} textLoc={location.state?.textLoc}/> */}
    </div>
  )
}
export default Test