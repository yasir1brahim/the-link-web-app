import { useState, useEffect } from "react";
import { getTeamLogo } from "../api/Authentication/api";

const useCompanyDetails = (teamId) => {
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!teamId) return;
      try {
        setIsLoading(true);
        // Use optimized logo endpoint instead of full team details
        const response = await getTeamLogo(teamId);
        setCompanyLogoUrl(response.data.logo_url || "");
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
