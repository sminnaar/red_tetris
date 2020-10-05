import React from 'react';
import { StyledStage } from './styles/StyledStage'

export default function Chat({ stage, room, user, }) {

    const { messages, sendMessage } = useChat(room);
    const [newMessage, setNewMessage] = useState("");

    const handleNewMessageChange = (event) => {
        setNewMessage(event.target.value);
    };

    const handleSendMessage = () => {
        sendMessage(newMessage);
        setNewMessage("");
    };

    return (
        <StyledStage width={stage[0].length} height={stage.length}>
            < div >
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
        </StyledStage>

    );
}