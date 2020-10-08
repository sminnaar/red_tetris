import React, { useState, useEffect, useRef } from 'react'
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
        leader,
        getLeader,
        start,
        pieces,
        startRound,
        endRound,
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

    const [nextPiece, setNextPiece] = useState(0);

    const boardRef = useRef(null);

    const handleNewMessageChange = (event) => {
        setNewMessage(event.target.value);
    };

    const handleSendMessage = () => {
        sendMessage(newMessage);
        setNewMessage("");
    };

    const [dropTime, setDroptime] = useState(null)
    const [gameOver, setGameOver] = useState(false)
    const [player, updatePlayerPos, resetPlayer, playerRotate, fall] = usePlayer(setNextPiece);
    const [stage, setStage, rowsCleared] = useStage(player, resetPlayer, pieces, nextPiece);
    const [rows, setRows] = useStatus(rowsCleared);
    const [winner, setWinner] = useStatus(false);

    const moveBlock = dir => {
        if (!checkCollision(player, stage, { x: dir, y: 0 })) {
            updatePlayerPos({ x: dir, y: 0 })
        }
    }


    const startGame = () => {
        // Reset everything

        setNextPiece(0)
        startRound();
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
                endRound();
                setNextPiece(0);
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
        // if (opponentDead) {
        //     setWinner(true);
        //     setDroptime(null);
        //     setNextPiece(0);
        // }
    }, [stage, sendStage, full, setLoading, opponentDead, setWinner]);

    useEffect(() => {
        getLeader();
        if (pieces && start) {
            setStage(createStage());
            setNextPiece(0);
            setWinner(false)
            setDroptime(1000);
            setGameOver(false);
            setRows(0);
            resetPlayer(pieces, nextPiece);
            sendStage(stage);
            boardRef.current.focus();
        }
        else if (!start) {
            // setStage(createStage());
            // sendStage(stage);
            setNextPiece(0);
            setWinner(true)
            setDroptime(null);
            setGameOver(false);
            setRows(0);
        }

    }, [pieces, start, leader]);

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
                to={{ pathname: '/', state: { error: 'Room full or game already started' } }}
            />
        )
    } else {
        return (
            <>
                <StyledTetrisWrapper
                    ref={boardRef}
                    role="button" tabIndex="0"
                    onKeyDown={e => move(e) && console.log(e.keyCode)}
                    onKeyUp={keyUp}
                >
                    <StyledTetris>
                        <Stage stage={stage} id='1' />

                        <StyledPanel>
                            {/* <h3 className="room-name">Room: {room}</h3> */}
                            {/* <h3 className="room-name">User: {user}</h3> */}
                            {leader && !start ? <StartButton callback={startGame} /> : (!start ? <Display text='Waiting for leader to start...' /> : null)}
                            {winner && !start ? <Display text="You have Won!!!" /> : null}
                            {gameOver ? <Display gameOver={gameOver} text="You Lost" /> : null}
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
                                )
                        </StyledPanel>

                        <Stage stage={opponentStage.body} id='2' />
                    </StyledTetris>
                </StyledTetrisWrapper >
            </>
        )
    }
}

export default Tetris;