import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import {BASE_URL} from '../utils/config';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Document, Page, pdfjs } from 'react-pdf'



const ViewPDFPage = ({token}) => {
    const navigate = useNavigate();
    const [signedUrl, setSignedUrl] = useState(null);
    const [fileId, setFileId] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const q = useParams();
    useEffect(() => {
        const queryParameters = new URLSearchParams(window.location.search);
        const q = queryParameters.get('id');
        setFileId(q);
    }, [q]);

    pdfjs.GlobalWorkerOptions.workerSrc = 
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

    useEffect(() => {
        const fetchPdf = async () => {

            try {
                const response = await fetch(`${BASE_URL}/api/signed-url?id=${fileId}`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': 'Bearer ' + token,
                    },
                });
                const data = await response.json();
                if (data.success) {
                    console.log('signed url', data.url);
                    setSignedUrl(data.url);
                }
            } catch (error) {
                console.log('error: ', error);
            }            
        }
        if (fileId) {
            fetchPdf();
        }
    }, [fileId]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        console.log('num pages: ', numPages);
        setNumPages(numPages);
        setPageNumber(1);
    }

    //

    return (
        <>
            <div className="container" style={{height: '100%'}}>
                <div className="row" style={{height: '100%'}}>
                    <div className="col-12 mt-3 mb-5">
                        <Header 
                            isLoggedIn={true}
                        />
                    </div>
                    <div className="col-12" style={{height: '90%'}}>
                        { 1 == 2 && (
                        <Document file={{url: signedUrl }} onLoadSuccess={onDocumentLoadSuccess} >                            
                            <Page pageNumber={pageNumber} />
                        </Document>
                        )} 
                        { signedUrl && (
                            <iframe src={signedUrl} style={{width: '100%', height: '100%'}}></iframe>

                        )}
                    </div>
                </div>
            </div>
        </>
    )

}

export default ViewPDFPage;