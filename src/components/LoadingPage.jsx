import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarTop from "./shared/NavbarTop/NavbarTop";
import Loader from "./shared/Loader/Loader";
import { getHomeUrl } from '../utils/navigation';
import { AuthContext } from '../auth/authcontext';
import { getUserTeams } from '../api/Authentication/api';


const LoadingPage = () => {
    const { setUserDetails, isAuthenticated, user } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
    const history = useNavigate();


    useEffect(() => {
        const fetchData = async () => {
            try {
                await getHomeUrl(null, isAuthenticated, user, getUserTeams, history);
            } catch (error) {
                console.error("Error in fetching home urls:", error);
            }
        };
        fetchData();
    }, [history, isAuthenticated, user, getUserTeams]);
    
    return (
        <div>
            <div className="page-wrap">
                <NavbarTop />
            </div>
          <Loader showComponentLoader={isLoading} />
        </div>
    )
}

export default LoadingPage;