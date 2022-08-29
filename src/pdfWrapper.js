import PdfReader from './components/PdfReader'
// import { useLocation } from 'react-router-dom';

import React from 'react'
const PdfWrapper = (props) => {
  // const location = useLocation()
  return (

    <div className='ss-pdf-wrraper'>
      {/* <PdfReader url={`https://linkdocs.s3.amazonaws.com/original/project_10_05_5000_-_METAL_FABRICATIONS.pdf`}/> */}
      <PdfReader url={props.pdfData.url} textLoc={props.pdfData.textLoc} docId={props.pdfData.docId}/>
      {/* <PdfReader
        url={new URLSearchParams(location.search).get('url') || ''}
        textLoc={JSON.parse(new URLSearchParams(location.search).get('textLoc').replaceAll("'", '"'))}
      /> */}
    </div>
  )
}
export default PdfWrapper