import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:8080";

const useLobby = () => {

    const [joined, setJoined] = useState(false);

    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = socketIOClient(SOCKET_SERVER_URL);

        socketRef.current.on('joinRoom', (error, data) => {
            if (error) {
                setJoined(false);
            }
            else if (data) {
                setJoined(true);
            }
        });

        // return () => {
        //     socketRef.current.disconnect();
        // };
    }, [setJoined]);
    // });

    const joinRoom = (roomName) => {
        socketRef.current.emit('joinRoom', roomName, () => {

            setJoined(true);
            console.log('Joined!')
        });
    };

    const createRoom = (roomName) => {
        socketRef.current.emit('createRoom', roomName, () => {
            console.log('Created!')
        });
    };


    return { joined, joinRoom, createRoom };
};

export default useLobby;


// client.emit('eventToEmit', dataToEmit, function(error, message){
//     console.log(error);
//     console.log(message);
// });
// Then I can fire a callback from server-side like this:

// client.on('eventToEmit', function(data, callback){
//     console.log(data);
//     callback('error', 'message');
// });
