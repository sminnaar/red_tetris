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
import { useTetris } from '../hooks/useTetris';

const Tetris = (props) => {
    const url = props.location.pathname;
    const room = url.substring(1, url.indexOf('['));
    const user = url.substring((url.indexOf('[') + 1), url.indexOf(']'));

    const {
        winner,
        add,
        setAdd,
        clearRow,
        leader,
        getLeader,
        start,
        pieces,
        startRound,
        endRound,
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
    const [addRow, stage, setStage, rowsCleared, setRowsCleared] = useStage(player, resetPlayer, pieces, nextPiece, clearRow);

    const moveBlock = dir => {
        if (!checkCollision(player, stage, { x: dir, y: 0 })) {
            updatePlayerPos({ x: dir, y: 0 })
        }
    }

    const startGame = () => {
        setNextPiece(0)
        startRound();
    }

    const drop = () => {
        if (!checkCollision(player, stage, { x: 0, y: 1 })) {
            updatePlayerPos({ x: 0, y: 1, collided: false })
        } else {
            if (player.pos.y < 1) {
                setGameOver(true)
                setDroptime(null)
                sendGameOver();
                setNextPiece(0);
                endRound();
            }
            updatePlayerPos({ x: 0, y: 0, collided: true })
        }
    }

    const keyUp = ({ keyCode }) => {
        if (!gameOver) {
            if (keyCode === 40) {
                setDroptime(1000);
            }
        }
    }

    const dropPlayer = () => {
        setDroptime(null);
        drop();
    }

    const move = ({ keyCode }) => {
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
    }, dropTime);

    useEffect(() => {
        if (rowsCleared) {
            clearRow();
            setRowsCleared(0);
        }
        if (add) {
            addRow(stage, setStage);
            updatePlayerPos({ x: 0, y: 0, collided: false });
            setAdd(false);
            // sendStage(stage);
        }
        sendStage(stage);
        if (!full) {
            setLoading(false);
        }
    }, [stage, sendStage, full, setLoading, add, addRow, clearRow, rowsCleared, setAdd, setRowsCleared, setStage, updatePlayerPos]);

    useEffect(() => {
        getLeader();
        if (pieces && start) {
            setGameOver(false);
            setStage(createStage());
            setNextPiece(0)
            setDroptime(1000);
            resetPlayer(pieces, nextPiece);
            sendStage(stage);
            boardRef.current.focus();
        }
        else if (!start) {
            setNextPiece(0);
            setDroptime(null);
        }
    }, [pieces, start, leader, getLeader, nextPiece, resetPlayer, sendMessage, sendStage, setStage, stage]);

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
                    onKeyDown={e => move(e)}
                    onKeyUp={keyUp}
                >
                    <StyledTetris>
                        <Stage stage={stage} id='1' />

                        <StyledPanel>
                            {/* <h3 className="room-name">Room: {room}</h3> */}
                            {/* <h3 className="room-name">User: {user}</h3> */}
                            {leader && !start ? <StartButton callback={startGame} /> : (!start ? <Display text='Waiting...' /> : null)}
                            {winner && !start ? <Display text="You win!" /> : null}
                            {gameOver ? <Display gameOver={gameOver} text="You lose!" /> : null}
                            < div >
                                <div className="messages-container">
                                    <ol className="messages-list">
                                        {messages.map((message, i) => (
                                            <li key={i} className={`message-item ${message.ownedByCurrentUser ? "my-message" : "received-message"}`} >
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