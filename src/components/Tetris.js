import React, { useState, useEffect } from 'react'
import { Redirect } from 'react-router-dom';

import { createStage, checkCollision } from '../lib/helpers'

// Styled Components
import { StyledTetrisWrapper, StyledTetris } from './styles/StyledTetris'

import { StyledPanel, StyledInput } from './styles/StyledPanel'

import "../components/Chat.css";

// Components
import Stage from './Stage'
import Display from './Display'
import StartButton from './StartButton'
import Loader from './Loader'

// Custom Hooks
import { useInterval } from '../hooks/useInterval'
import { usePlayer } from '../hooks/usePlayer'
import { useStage } from '../hooks/useStage'
import { useStatus } from '../hooks/useStatus';
import { useTetris } from '../hooks/useTetris';

const Tetris = (props) => {
    const url = props.location.pathname;

    const room = url.substring(1, url.indexOf('['));
    const user = url.substring((url.indexOf('[') + 1), url.indexOf(']'));

    const {
        opponentDead,
        full,
        messages,
        sendMessage,
        sendStage,
        sendGameOver,
        opponentStage
    } = useTetris(room, user);

    const [loading, setLoading] = useState(true)

    const [newMessage, setNewMessage] = useState("");

    const handleNewMessageChange = (event) => {
        setNewMessage(event.target.value);
    };

    const handleSendMessage = () => {
        sendMessage(newMessage);
        setNewMessage("");
    };

    const [dropTime, setDroptime] = useState(null)
    const [gameOver, setGameOver] = useState(false)
    const [player, updatePlayerPos, resetPlayer, playerRotate, fall] = usePlayer();
    const [stage, setStage, rowsCleared] = useStage(player, resetPlayer);
    const [rows, setRows] = useStatus(rowsCleared);
    const [winner, setWinner] = useStatus('');

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
        // setScore(0);
        setRows(0);
        // setLevel(0);
    }


    const drop = () => {
        if (!checkCollision(player, stage, { x: 0, y: 1 })) {
            updatePlayerPos({ x: 0, y: 1, collided: false })
        } else {
            if (player.pos.y < 1) {
                // Game Over!!!!
                setGameOver(true)
                setDroptime(null)
                sendGameOver();
            }
            updatePlayerPos({ x: 0, y: 0, collided: true })
        }
    }

    const keyUp = ({ keyCode }) => {
        if (!gameOver) {
            if (keyCode === 40) {
                // console.log("Interval On");
                setDroptime(1000);
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
            } else if (keyCode === 32) {
                fall(stage)
            }
        }
    };


    useInterval(() => {
        drop();
    }, dropTime)

    useEffect(() => {
        sendStage(stage);
        if (!full) {
            setLoading(false);
        }
        if (opponentDead)
            setWinner(true);
    }, [stage, sendStage, full, setLoading, opponentDead, setWinner]);


    if (loading) {
        return (
            <StyledPanel>
                <Loader />
            </StyledPanel>
        )
    }
    if (full) {
        return (
            <Redirect
                to={{ pathname: '/', state: { error: 'Room full' } }}
            />
        )
    } else {
        return (
            <>
                <StyledTetrisWrapper
                    role="button" tabIndex="0"
                    onKeyDown={e => move(e) && console.log(e.keyCode)}
                    onKeyUp={keyUp}
                >
                    <StyledTetris>
                        <Stage stage={stage} id='1' />

                        <StyledPanel>
                            <StartButton callback={startGame} />
                            <h3 className="room-name">Room: {room}</h3>
                            <h3 className="room-name">User: {user}</h3>
                            {winner ? <Display text="You have Won!!!" /> : null}
                            {gameOver ? (
                                <Display gameOver={gameOver} text="Game Over" />
                            ) : (
                                    < div >
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

                                        <StyledInput>
                                            <textarea
                                                value={newMessage}
                                                onChange={handleNewMessageChange}
                                                placeholder="Write message..."
                                                className="new-message-input-field"
                                            />
                                            <button onClick={handleSendMessage} className="send-message-button">
                                                Send
                                    </button>
                                        </StyledInput>
                                    </div>
                                )}
                        </StyledPanel>

                        <Stage stage={opponentStage.body} id='2' />
                    </StyledTetris>
                </StyledTetrisWrapper >
            </>
        )
    }
}

export default Tetris;