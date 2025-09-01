import { useCallback } from 'react';
import { getProjectDetails } from '../api/Projects/api';

const useDocumentRefresh = (projectId, setDocumentData, setDocParsed, projectVersionId = null) => {
  const refreshDocuments = useCallback(async () => {
    try {
      const response = await getProjectDetails(projectId, projectVersionId);
      setDocumentData(response.data.document_details || []);
      setDocParsed(response.data.doc_parsed);
    } catch (error) {
      console.error('Error refreshing document data:', error);
    }
  }, [projectId, setDocumentData, setDocParsed, projectVersionId]);

  return refreshDocuments;
};

export default useDocumentRefresh; 