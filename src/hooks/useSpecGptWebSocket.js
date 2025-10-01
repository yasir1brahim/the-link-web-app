import { useEffect, useRef, useState, useCallback, useContext } from 'react';
import { AuthContext } from '../auth/authcontext';

export const useSpecGptWebSocket = (projectId, onMessage, onError, onComplete) => {
    const { token } = useContext(AuthContext);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const unmountedRef = useRef(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const getWsUrl = useCallback(() => {
        const baseUrl = window.location.href.includes('https://app-dj.thelink.ai') 
            ? 'wss://app-dj-qa-api.thelink.ai'
            : window.location.href.includes('https://app.thelink.ai')
            ? 'wss://log-manager-api-prod.thelink.ai'
            : 'ws://localhost:8000';
        return `${baseUrl}/ws/specgpt/${projectId}/?token=${token}`;
    }, [projectId, token]);

    const connect = useCallback(async () => {
        if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
            return;
        }

        if (!projectId) {
            console.error('No projectId provided for WebSocket connection');
            return;
        }

        if (!token) {
            console.error('No authentication token available');
            onError(new Error('No authentication token available'));
            return;
        }

        setIsConnecting(true);
        try {
            const wsUrl = getWsUrl();
            console.log('Connecting to WebSocket:', wsUrl);
            
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                setIsConnected(true);
                setIsConnecting(false);
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    onMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                    onError(error);
                }
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                onError(error);
                setIsConnecting(false);
            };

            wsRef.current.onclose = (event) => {
                console.log('WebSocket closed:', event.code, event.reason);
                setIsConnected(false);
                setIsConnecting(false);
                
                if (!unmountedRef.current && event.code !== 1000 && projectId) {
                    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, 5000);
                }
            };

        } catch (error) {
            console.error('Error connecting to WebSocket:', error);
            onError(error);
            setIsConnecting(false);
        }
    }, [projectId, token, onMessage, onError, getWsUrl]);

    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close(1000, 'Disconnecting intentionally');
            wsRef.current = null;
        }
    }, []);

    const sendMessage = useCallback((message) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected');
            onError(new Error('WebSocket is not connected'));
        }
    }, [onError]);

    const ping = useCallback(() => {
        sendMessage({ type: 'ping' });
    }, [sendMessage]);

    useEffect(() => {
        unmountedRef.current = false;
        return () => {
            unmountedRef.current = true;
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            disconnect();
        };
    }, [disconnect]);

    return {
        connect,
        disconnect,
        sendMessage,
        ping,
        isConnected,
        isConnecting
    };
};