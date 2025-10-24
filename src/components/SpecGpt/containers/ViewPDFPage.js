import React, { useState, useEffect } from 'react';
import ProjectLogsReader from '../../PdfReader/projectLogsReader';
import { useS3LinkValidation } from '../../../hooks/useS3LinkValidation.js';

const ViewPDFPage = () => {
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(false);
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
                    loading={loading}
                    setLoading={setLoading}
                    onError={handleError}
                />
            )}
        </div>
    );
};

export default ViewPDFPage;