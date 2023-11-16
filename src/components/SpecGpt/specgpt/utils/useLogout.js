import { useNavigate, Link } from 'react-router-dom';
import useToken from './useToken';

function useLogout() {
    const {removeToken} = useToken(); 
    const navigate = useNavigate();

    function invoke(response) {           
        if (response.status === 401) {
            removeToken();
            navigate('/');
        }        
    }
    return {
        checkIfLoggedOut: invoke,
    }
}

export default useLogout;