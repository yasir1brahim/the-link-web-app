import React, { useState, useEffect } from 'react';
import ProjectLogsReader from '../../PdfReader/projectLogsReader';
import { useS3LinkValidation } from '../../../hooks/useS3LinkValidation.js';

const ViewPDFPage = () => {
    const [pdfUrl, setPdfUrl] = useState(null);
    const { handleError, ErrorModal } = useS3LinkValidation();

    useEffect(() => {
        const search = window.location.search.replace('?url=', '');
        setPdfUrl(search);
    }, []);

    return (
        <div style={{ height: '100vh' }}>
            <ErrorModal />
            {pdfUrl && (
                <ProjectLogsReader 
                    url={pdfUrl} 
                    onError={handleError}
                />
            )}
        </div>
    );
};

export default ViewPDFPage;