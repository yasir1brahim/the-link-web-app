import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Loader from "../shared/Loader/Loader";
import { IconButton, Checkbox } from "@mui/material";
import { ReactComponent as DownloadIcon } from "../../assets/images/file-download.svg";
import StyledTooltip from "../shared/StyledTooltip/StyledTooltip";
import { getSpecSections, bulkDownloadSpecSections } from "../../api/ProjectLogs/api";

const SpecSectionsTab = ({ projectId, projectVersionId }) => {
  const [specSections, setSpecSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedSections, setSelectedSections] = useState(new Set());

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

  const handleSelectSection = (sectionId) => {
    const newSelectedSections = new Set(selectedSections);
    if (newSelectedSections.has(sectionId)) {
      newSelectedSections.delete(sectionId);
    } else {
      newSelectedSections.add(sectionId);
    }
    setSelectedSections(newSelectedSections);
  };

  const handleSelectAll = () => {
    if (selectedSections.size === specSections.length) {
      setSelectedSections(new Set());
    } else {
      setSelectedSections(new Set(specSections.map(section => section.id)));
    }
  };


  const handleBulkDownload = async () => {
    if (selectedSections.size === 0) {
      toast.warning("Please select at least one spec section to download");
      return;
    }

    setIsDownloading(true);
    try {
      const sectionIds = Array.from(selectedSections);
      await bulkDownloadSpecSections(sectionIds);
      
      // Only show success message after download is actually completed
      setTimeout(() => {
        const count = selectedSections.size;
        toast.success(`${count} spec section${count > 1 ? 's' : ''} downloaded successfully`);
      }, 1000);
      
      // Clear selection after successful download
      setSelectedSections(new Set());
    } catch (error) {
      console.error('Error downloading spec sections:', error);
      
      let errorMessage = 'Failed to download spec sections';
      
      if (error.message?.includes('popup was blocked')) {
        errorMessage = 'Download failed and popup was blocked. Please allow popups and try again.';
      } else if (error.message?.includes('HTTP')) {
        errorMessage = 'Some spec sections are temporarily unavailable. Please try again later.';
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

  const getDownloadTooltip = () => {
    const count = selectedSections.size;
    if (count === 0) {
      return "Select spec sections to download";
    } else if (count === 1) {
      return "Download document";
    } else {
      return "Download all";
    }
  };

  return (
    <div>
      {specSections?.length ? (
        <div style={{ overflowX: "auto" }}>
          
          {/* Download button common */}
          <div className="d-flex justify-content-start mb-2">
            <div style={{ display: 'flex', gap: '4px' }}>
              <StyledTooltip title={isDownloading ? "Downloading spec sections..." : getDownloadTooltip()} arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={handleBulkDownload}
                    disabled={isDownloading || selectedSections.size === 0}
                    style={{
                      color: selectedSections.size > 0 ? '#1976d2' : '#999',
                      padding: '4px'
                    }}
                  >
                    <DownloadIcon style={{ width: '20px', height: '20px' }} />
                  </IconButton>
                </span>
              </StyledTooltip>
            </div>
          </div>

          <table className="table table-striped" style={{ minWidth: "600px", marginBottom: 0 }}>
            <thead>
              <tr>
                <th style={{ width: "5%", padding: "8px" }}>
                  <Checkbox
                    checked={selectedSections.size === specSections.length && specSections.length > 0}
                    indeterminate={selectedSections.size > 0 && selectedSections.size < specSections.length}
                    onChange={handleSelectAll}
                    size="small"
                  />
                </th>
                <th style={{ width: "20%", padding: "8px" }}>Spec Section</th>
                <th style={{ width: "75%", padding: "8px" }}>Document Name</th>
              </tr>
            </thead>
            <tbody>
              {specSections.map((section) => (
                <tr key={section.id}>
                  <td style={{ padding: "8px" }}>
                    <Checkbox
                      checked={selectedSections.has(section.id)}
                      onChange={() => handleSelectSection(section.id)}
                      size="small"
                    />
                  </td>
                  <td style={{ fontSize: "14px", padding: "8px" }}>
                    {section.masterformat_number}
                  </td>
                  <td style={{ fontSize: "14px", padding: "8px" }}>
                    {section.document_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>No spec sections available.</div>
      )}
      
      {/* Loading overlay */}
      <Loader showComponentLoader={isDownloading} />
    </div>
  );
};

export default SpecSectionsTab;
