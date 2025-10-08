import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Loader from "../shared/Loader/Loader";
import { IconButton } from "@mui/material";
import { ReactComponent as DownloadIcon } from "../../assets/images/file-download.svg";
import StyledTooltip from "../shared/StyledTooltip/StyledTooltip";
import { getSpecSections, downloadSpecSection } from "../../api/ProjectLogs/api";

const SpecSectionsTab = ({ projectId, projectVersionId }) => {
  const [specSections, setSpecSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchSpecSections();
    }
  }, [projectId, projectVersionId]);

  const fetchSpecSections = async () => {
    setIsLoading(true);
    try {
      const response = await getSpecSections(projectId, projectVersionId);
      const sections = response.data.spec_sections || [];
      setSpecSections(sections || []);
    } catch (error) {
      console.error('Error fetching spec sections:', error);
      toast.error('Failed to load spec sections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (sectionId, sectionName) => {
    setIsDownloading(true);
    try {
      await downloadSpecSection(sectionId);
      toast.success("Spec Section Downloaded Successfully");
    } catch (error) {
      console.error('Error downloading spec section:', error);
      
      let errorMessage = 'Failed to download spec section';
      
      if (error.message?.includes('popup was blocked')) {
        errorMessage = 'Download failed and popup was blocked. Please allow popups and try again.';
      } else if (error.message?.includes('HTTP')) {
        errorMessage = 'Spec section is temporarily unavailable. Please try again later.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return <Loader showComponentLoader={true} />;
  }

  return (
    <div>
      {specSections?.length ? (
        <div style={{ overflowX: "auto" }}>
          <table className="table" style={{ minWidth: "600px" }}>
            <thead>
              <tr>
                <th style={{ width: "20%" }}>Spec Section</th>
                <th style={{ width: "70%" }}>Document Name</th>
                <th style={{ width: "10%" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {specSections.map((section) => (
                <tr key={section.id}>
                  <td style={{ fontSize: "14px" }}>
                    {section.masterformat_number}
                  </td>
                  <td style={{ fontSize: "14px" }}>
                    {section.document_name}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <StyledTooltip title="Download Spec Section" arrow>
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(section.id, section.section_title)}
                            disabled={isDownloading || !section.file_s3_key}
                            style={{ 
                              color: section.file_s3_key ? '#1976d2' : '#999',
                              padding: '4px'
                            }}
                          >
                            <DownloadIcon style={{ width: '20px', height: '20px' }}/>  
                          </IconButton>
                        </span>
                      </StyledTooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>No spec sections available.</div>
      )}
    </div>
  );
};

export default SpecSectionsTab;
