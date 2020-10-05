import React, { useState } from 'react'

import { createStage, checkCollision } from '../lib/helpers'

// Styled Components
import { StyledTetrisWrapper, StyledTetris } from './styles/StyledTetris'

// Components
import Stage from './Stage'
import Display from './Display'
import StartButton from './StartButton'

// Custom Hooks
import { useInterval } from '../hooks/useInterval'
import { usePlayer } from '../hooks/usePlayer'
import { useStage } from '../hooks/useStage'
import { useGameStatus } from '../hooks/useGameStatus';

import useInfo from '../hooks/useInfo';

const Tetris = () => {


    const { rooms, users, getInfo } = useInfo();


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


    const handleInfo = () => {
        getInfo()
        getInfo()
        console.log("Info")
        console.log(users)
        console.log(rooms)
    };

    return (
        <>
            <StyledTetrisWrapper
                role="button" tabIndex="0"
                onKeyDown={e => move(e) && console.log(e.keyCode)}
                onKeyUp={keyUp}
            >
                <StyledTetris>
                    <Stage stage={stage} />

                    <aside>
                        {gameOver ? (
                            <Display gameOver={gameOver} text="Game Over" />
                        ) : (
                                < div >
                                    <Display text={`Score: ${score}`} />
                                    <Display text={`Rows: ${rows}`} />
                                    <Display text={`Level: ${level}`} />
                                </div>
                            )}
                    </aside>

                    <button onClick={handleInfo} className="input-button">
                        Info
                        </button>

                    <StartButton callback={startGame} />


                </StyledTetris>

            </StyledTetrisWrapper >
        </>
    )
}

export default Tetris;


