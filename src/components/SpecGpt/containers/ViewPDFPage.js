import React, { useState, useEffect } from 'react';
import ProjectLogsReader from '../../PdfReader/projectLogsReader';

const ViewPDFPage = () => {
    const [pdfUrl, setPdfUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const search = window.location.search.replace('?url=', '');
        setPdfUrl(search);
    }, []);

    return (
        <div style={{ height: '100vh' }}>
            {pdfUrl && (
                <ProjectLogsReader url={pdfUrl} setLoading={setIsLoading} />
            )}
        </div>
    );
};

export default ViewPDFPage;