import { useCallback } from 'react';
import { getProjectDetails } from '../api/Projects/api';

const useDocumentRefresh = (projectId, setDocumentData, setDocParsed) => {
  const refreshDocuments = useCallback(async () => {
    try {
      const response = await getProjectDetails(projectId);
      setDocumentData(response.data.document_details || []);
      setDocParsed(response.data.doc_parsed);
    } catch (error) {
      console.error('Error refreshing document data:', error);
    }
  }, [projectId, setDocumentData, setDocParsed]);

  return refreshDocuments;
};

export default useDocumentRefresh; 