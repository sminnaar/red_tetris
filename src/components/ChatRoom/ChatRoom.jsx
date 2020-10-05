import React from "react";

// import "./ChatRoom.css";
import useChat from "../../hooks/useChat";
// import useGameState from "../../hooks/useGameState";

import Tetris from '../Tetris';

const ChatRoom = (props) => {
  // console.log(props.player)
  const url = props.url;
  const player = props.player;
  //   const { roomId } = props.match.params;
  const room = url.substring(1, props.url.indexOf('['));
  const user = url.substring((url.indexOf('[') + 1), url.indexOf(']'));
  const { messages, sendMessage } = useChat(room, player);
  const [newMessage, setNewMessage] = React.useState("");

  const handleNewMessageChange = (event) => {
    setNewMessage(event.target.value);
  };

  const handleSendMessage = () => {
    sendMessage(newMessage);
    setNewMessage("");
  };

  return (
    // <div className="chat-room-container">
    <div>
      {/* <Tetris /> */}
      <h1 className="room-name">Room: {room}</h1>
      <h1 className="room-name">User: {user}</h1>
      <div className="messages-container">
        <ol className="messages-list">
          {messages.map((message, i) => (
            <li
              key={i}
              className={`message-item ${message.ownedByCurrentUser ? "my-message" : "received-message"
                }`}
            >
              {message.body}
            </li>
          ))}
        </ol>
      </div>
      <textarea
        value={newMessage}
        onChange={handleNewMessageChange}
        placeholder="Write message..."
        className="new-message-input-field"
      />
      <button onClick={handleSendMessage} className="send-message-button">
        Send
          </button>
    </div>
  );
};

export default React.memo(ChatRoom);
