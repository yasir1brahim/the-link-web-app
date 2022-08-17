import PdfReader from './components/PdfReader'
import { useLocation } from 'react-router-dom';


import React from 'react'
const Test = () => {
  const location = useLocation()
  return (

    <div>
      {/* <PdfReader url={`https://linkdocs.s3.amazonaws.com/original/project_10_05_5000_-_METAL_FABRICATIONS.pdf`}/> */}
      <PdfReader
        url={new URLSearchParams(location.search).get('url') || ''}
        textLoc={JSON.parse(new URLSearchParams(location.search).get('textLoc').replaceAll("'", '"'))}
      />
    </div>
  )
}
export default Test