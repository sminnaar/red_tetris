import React, { useState } from 'react'

import { createStage, checkCollision } from '../lib/helpers'

// Styled Components
import { StyledTetrisWrapper, StyledTetris, StyledAside } from './styles/StyledTetris'

import "../components/ChatRoom/ChatRoom.css";

// Components
import Stage from './Stage'
import Display from './Display'
import StartButton from './StartButton'

import Chat from './Chat'
import ChatRoom from './ChatRoom/ChatRoom'

// Custom Hooks
import { useInterval } from '../hooks/useInterval'
import { usePlayer } from '../hooks/usePlayer'
import { useStage } from '../hooks/useStage'
import { useGameStatus } from '../hooks/useGameStatus';
import useChat from '../hooks/useChat';


import socketIOClient from "socket.io-client";


const Tetris = (props) => {

    // console.log(props)
    const url = props.location.pathname;
    // console.log(url)
    const room = url.substring(1, url.indexOf('['));
    const user = url.substring((url.indexOf('[') + 1), url.indexOf(']'));

    const [dropTime, setDroptime] = useState(null)
    const [gameOver, setGameOver] = useState(false)

    const [
        player,
        updatePlayerPos,
        resetPlayer,
        playerRotate
    ] = usePlayer();

    const [stage,
        setStage,
        rowsCleared
    ] = useStage(player, resetPlayer);

    const [score,
        setScore,
        rows,
        setRows,
        level,
        setLevel
    ] = useGameStatus(rowsCleared);



    const { messages, sendMessage } = useChat(room, player);
    const [newMessage, setNewMessage] = useState("");



    // Shows when the stage is rendered
    // console.log('re-render')

    const moveBlock = dir => {
        if (!checkCollision(player, stage, { x: dir, y: 0 })) {
            updatePlayerPos({ x: dir, y: 0 })
        }
    }

    const startGame = () => {
        // Reset everything
        setStage(createStage());
        setDroptime(1000);
        resetPlayer();
        setGameOver(false);
        setScore(0);
        setRows(0);
        setLevel(0);

    }

    const drop = () => {
        // Level Up when player has cleared 10 rows
        if (rows > (level + 1) * 10) {
            setLevel(prev => prev + 1);
            // Increase speed
            setDroptime(1000 / (level + 1) + 200);
        }
        if (!checkCollision(player, stage, { x: 0, y: 1 })) {
            updatePlayerPos({ x: 0, y: 1, collided: false })
        } else {
            if (player.pos.y < 1) {
                // console.log('GAME OVER!!!')
                setGameOver(true)
                setDroptime(null)
            }
            updatePlayerPos({ x: 0, y: 0, collided: true })
        }
    }

    const keyUp = ({ keyCode }) => {
        if (!gameOver) {
            if (keyCode === 40) {
                // console.log("Interval On");
                setDroptime(1000 / (level + 1) + 200);
            }
        }
    }

    const dropPlayer = () => {
        // console.log("Interval Off");
        setDroptime(null);
        drop();
    }

    const move = ({ keyCode }) => {
        // Check what inputs are used
        // To check keycode to modify controls
        // console.log(keyCode)
        if (!gameOver) {
            if (keyCode === 37) {
                moveBlock(-1);
            } else if (keyCode === 39) {
                moveBlock(1);
            } else if (keyCode === 40) {
                dropPlayer();
            } else if (keyCode === 38) {
                playerRotate(stage, 1);
            }
        }
    };

    useInterval(() => {
        drop();
    }, dropTime)



    const handleNewMessageChange = (event) => {
        setNewMessage(event.target.value);
    };

    const handleSendMessage = () => {
        sendMessage(newMessage);
        setNewMessage("");
    };

    return (
        <><StyledTetrisWrapper
            role="button" tabIndex="0"
            onKeyDown={e => move(e) && console.log(e.keyCode)}
            onKeyUp={keyUp}
        >
            <StyledTetris>
                <Stage stage={stage} />
                <StartButton callback={startGame} />

                <StyledAside>
                    <aside>
                        {gameOver ? (
                            <Display gameOver={gameOver} text="Game Over" />
                        ) : (
                                < div >
                                    {/* <StartButton callback={startGame} /> */}

                                    {/* <h1 className="room-name">Room: {room}</h1> */}
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
                            )}
                    </aside>
                </StyledAside>
            </StyledTetris>
        </StyledTetrisWrapper >
        </>
    )
}

export default Tetris;