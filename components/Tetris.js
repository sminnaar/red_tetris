import React, { useState } from 'react'

import { createStage, checkCollision } from '../gameHelpers'

// Styled Components
import { StyledTetrisWrapper, StyledTetris } from './styles/StyledTetris'

// Components
import Stage from './Stage'
import Display from './Display'
import StartButton from './StartButton'

// Custom Hooks
import { usePlayer } from '../hooks/usePlayer'
import { useStage } from '../hooks/useStage'

const Tetris = () => {
    const [dropTime, setDrooptime] = useState(null)
    const [gameOver, setGameOver] = useState(false)

    // const [player] = usePlayer()
    const [player, updatePlayerPos, resetPlayer] = usePlayer()
    const [stage, setStage] = useStage(player, resetPlayer)


    console.log('re-render')

    const moveBlock = dir => {
        if (!checkCollision(player, stage, { x: dir, y: 0 })) {
            updatePlayerPos({ x: dir, y: 0 })
        }
    }

    const startGame = () => {
        // Reset everything
        setStage(createStage());
        resetPlayer();
        setGameOver(false);
    }

    const drop = () => {
        if (!checkCollision(player, stage, { x: 0, y: 1 })) {
            updatePlayerPos({ x: 0, y: 1, collided: false })
        } else {
            if (player.pos.y < 1) {
                console.log('GAME OVER!!!')
                setGameOver(true)
                setDrooptime(null)
            }
            updatePlayerPos({ x: 0, y: 0, collided: true })
        }
    }

    const dropPlayer = () => {
        drop()
    }

    const move = ({ keyCode }) => {
        if (!gameOver) {
            if (keyCode === 37) {
                moveBlock(-1)
            } else if (keyCode === 39) {
                moveBlock(1)
            } else if (keyCode === 40) {
                dropPlayer()
            }
        }
    }

    return (
        <StyledTetrisWrapper role="button" tabIndex="0" onKeyDown={e => move(e)}>
            <StyledTetris>
                <Stage stage={stage} />
                <aside>
                    {gameOver ? (
                        <Display gameOver={gameOver} text="Game Over" />
                    ) : (
                            < div >
                                <Display text='Score' />
                                <Display text='Rows' />
                                <Display text='Level' />
                            </div>
                        )}
                    <StartButton callback={startGame} />
                </aside>
            </StyledTetris>
        </StyledTetrisWrapper >
    )
}

export default Tetris;