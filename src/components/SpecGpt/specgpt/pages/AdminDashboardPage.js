import React, { useState, useEffect } from "react";
import { BASE_URL } from '../utils/config';
import useLogout from '../utils/useLogout';
import { useNavigate, Link } from 'react-router-dom';

const AdminDashboardPage = ({token}) => {
    const {checkIfLoggedOut} = useLogout();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); // user_id
    const [sessions, setSessions] = useState([]);
    const [emptySessions, setEmptySessions] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null); // session_id
    const [chatHistory, setChatHistory] = useState([]);

    useEffect(() => {

        const getUsers = async () => {
            const url = `${BASE_URL}/api/admin-dashboard`;
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token,
                    },
                });
                checkIfLoggedOut(response);
                const data = await response.json();
                setUsers(data.users);
            } catch (error) {
                console.log(error);
            }            
        }

        getUsers();
    }, [token]);


    const loadSessionHistory = async (user_id) => {
        setEmptySessions(false);
        setSessions([]);
        setChatHistory([]);
        setSelectedUser(user_id);
        setSelectedSession(null);        
        const url = `${BASE_URL}/api/admin-load-user-sessions?user_id=${user_id}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
            });
            checkIfLoggedOut(response);
            const data = await response.json();
            if (data.session_history.length === 0) {
                setEmptySessions(true);
            }
            setSessions(data.session_history);
        } catch (error) {

            console.log(error);
        }  
    }


    const loadChatHistory = async (session_id) => {
        setSelectedSession(session_id);
        setChatHistory([]);
        const url = `${BASE_URL}/api/admin-load-chat-history?session_id=${session_id}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },                
            });
            checkIfLoggedOut(response);
            const data = await response.json();
            setChatHistory(data.chat_history);
        } catch (error) {
            console.log(error);
        }

    }
    return (
        <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <h1>Admin Dashboard</h1>
                    <a href="/chat">Go to chat</a>
                    <hr />
                </div>
                <div className="col-3">
                    {users.map((user, index) => (
                        
                        <div key={index} className={selectedUser === user.id ? "card bg-info" : "card"} style={{cursor: 'pointer'}}>
                            <div className="card-body" onClick={() => loadSessionHistory(user.id)}>
                                <p>{user.email}</p>                                
                                <p>Role: {user.role}</p>                                
                                <p>Company: {user.company}</p>
                                <p>Doc count: {user.doc_count}</p>
                                <p>Created at: {user.created_at}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="col-3">
                    {emptySessions && <p>No Chat history found</p>}
                    {sessions.map((session, index) => (
                        <div key={index} className={selectedSession === session.session_id ? "card bg-info" : "card"} style={{cursor: 'pointer'}}>
                            <div className="card-body" onClick={() => loadChatHistory(session.session_id)}>
                                <p>Session: {session.question}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="col-6">
                    {chatHistory.map((chat, index) => {
                        if (chat.role == 'human') {
                            return (<div key={index} style={{background: 'grey', padding: '30px'}}>                                  
                            <strong>User:</strong> {chat.message}
                            </div>)
                        }
                        else {
                            return (<div key={index} style={{background: 'white', padding: '30px'}}>
                                <strong>Assistant:</strong> <span dangerouslySetInnerHTML={{__html: chat.message}}></span>
                            </div>)
                        }
                    })}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboardPage;