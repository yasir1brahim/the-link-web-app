import { useState, useEffect } from "react";
import { getTeamDetails } from "../api/Authentication/api"; 

const useCompanyDetails = (teamId) => {
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!teamId) return;
      try {
        setIsLoading(true);
        const response = await getTeamDetails(teamId);
        setCompanyLogoUrl(response.data.legacy_logo_url || "");
        setCompanyName(response.data.name || "");
      } catch (error) {
        setCompanyLogoUrl("");
        setCompanyName("");
        console.error("Error fetching company details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [teamId]);

  return { companyLogoUrl, companyName, isLoading };
};

export default useCompanyDetails;
