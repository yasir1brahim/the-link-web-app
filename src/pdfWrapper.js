import PdfReader from './components/PdfReader'
// import { useLocation } from 'react-router-dom';


import React from 'react'
const PdfWrapper = (props) => {
  // const location = useLocation()
  return (

    <div className='ss-pdf-wrraper'>
      <button
        type="button"
        className="btn btn-secondary btn-sm close-pdf"
        onClick={() => props.setPdfData({url: '', textLoc: {}})}
      >
        Close Pdf
      </button>
      {/* <PdfReader url={`https://linkdocs.s3.amazonaws.com/original/project_10_05_5000_-_METAL_FABRICATIONS.pdf`}/> */}
      <PdfReader url={props.pdfData.url} textLoc={props.pdfData.textLoc} />
      {/* <PdfReader
        url={new URLSearchParams(location.search).get('url') || ''}
        textLoc={JSON.parse(new URLSearchParams(location.search).get('textLoc').replaceAll("'", '"'))}
      /> */}
    </div>
  )
}
export default PdfWrapper