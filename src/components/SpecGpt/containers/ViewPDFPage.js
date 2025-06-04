import React, { useState, useEffect } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

const ViewPDFPage = () => {
    const [pdfUrl, setPdfUrl] = useState(null);
    useEffect(() => {
        const search = window.location.search.replace('?url=', '');
        setPdfUrl(search);
    }, []);

    return (
        <div style={{ height: '100vh' }}>
            {pdfUrl && (
                <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
                    <Viewer fileUrl={pdfUrl} />
                </Worker>
            )}
        </div>
    );
};

export default ViewPDFPage;