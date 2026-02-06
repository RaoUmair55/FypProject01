import { createContext, useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import io from "socket.io-client";
import api from "../utils/api";

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { data: authUser, isLoading } = useAuthUser();

    // Assuming api.js baseURL is handled, but socket needs explicit URL if different
    // Since we are using relative paths in api.js, we might need to know the backend URL
    // But socket.io-client usually needs the full URL or defaults to window.location
    // Let's assume production/dev split. 
    // Ideally we should export BASE_URL from somewhere or hardcode logic akin to api.js

    // For now, let's try to deduce it or use a simpler approach.
    // If api.js uses a specific URL, socket should too.
    // In vite, we might use import.meta.env

    const SOCKET_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";


    useEffect(() => {
        if (authUser && !isLoading) {
            const socket = io(SOCKET_URL, {
                query: {
                    userId: authUser._id,
                },
            });

            setSocket(socket);

            socket.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });

            return () => {
                socket.close();
                setSocket(null);
            };
        } else if (!authUser && !isLoading) {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [authUser, isLoading]);

    return <SocketContext.Provider value={{ socket, onlineUsers }}>{children}</SocketContext.Provider>;
};
