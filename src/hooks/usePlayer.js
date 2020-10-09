import { useCallback, useState } from 'react'
import { STAGE_WIDTH, checkCollision } from '../lib/helpers';
import { TETROMINOS } from '../lib/tetrominos'

export const usePlayer = (setNextPiece) => {
    const [player, setPlayer] = useState({
        pos: { x: 0, y: 0 },
        tetromino: TETROMINOS[0].shape,
        collided: false,
    });

    function rotate(matrix, dir) {
        const rotatedTetro = matrix.map((_, index) =>
            matrix.map(column => column[index]));
        if (dir > 0) return rotatedTetro.map(row => row.reverse());
        return rotatedTetro.reverse();
    }

    function playerRotate(stage, dir) {
        const clonedPlayer = JSON.parse(JSON.stringify(player));
        clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

        const pos = clonedPlayer.pos.x;
        let offset = 1;
        while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
            clonedPlayer.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > clonedPlayer.tetromino[0].length) {
                rotate(clonedPlayer.tetromino, -dir);
                clonedPlayer.pos.x = pos;
                return;
            }
        }

        setPlayer(clonedPlayer);
    }

    const updatePlayerPos = ({ x, y, collided }) => {
        setPlayer(prev => ({
            ...prev,
            pos: { x: (prev.pos.x += x), y: (prev.pos.y += y) },
            collided,
        }));
    }

    const fall = (stage) => {
        const clonedPlayer = JSON.parse(JSON.stringify(player));
        while (!checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
            clonedPlayer.pos.y++;
        }
        clonedPlayer.pos.y--;
        setPlayer(clonedPlayer);
    }

    // const resetPlayer = useCallback(() => {
    //     setPlayer({
    //         pos: { x: STAGE_WIDTH / 2 - 1, y: 0 },
    //         tetromino: randomTetromino().shape,
    //         collided: false
    //     })
    // }, [])


    const resetPlayer = useCallback((pieces, nextPiece) => {
        setPlayer({
            //   pos: { x: STAGE_WIDTH / 2 - 1, y: 0 },
            pos: { x: STAGE_WIDTH / 2 - 1, y: 0 },
            tetromino: pieces[nextPiece].shape,
            collided: false
        });
        if (nextPiece + 1 > pieces.length - 1) {
            setNextPiece(0);
        } else {
            setNextPiece(nextPiece + 1)
        }
    }, [setNextPiece]);

    return [player, updatePlayerPos, resetPlayer, playerRotate, fall];
}

