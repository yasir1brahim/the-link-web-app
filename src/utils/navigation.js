export const getHomeUrl = async (e, isAuthenticated, user, getUserTeams, navigate) => {
    e.preventDefault();
  
    if (isAuthenticated && user?.is_superuser) {
      navigate({ pathname: '/companies' });
      return;
    }
  
    if (isAuthenticated) {
      const teams = await getUserTeams();
      if (teams?.data?.results?.length === 1) {
        const singleTeamId = teams.data.results[0].id;
        navigate({ pathname: `/project-list/${singleTeamId}` });
      } else {
        navigate({ pathname: '/companies' });
      }
      return;
    }
  
    navigate({ pathname: '/' });
};