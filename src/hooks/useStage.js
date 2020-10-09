import { useState, useEffect } from 'react'
import { createStage } from '../lib/helpers'

export const useStage = (player, resetPlayer, pieces, nextPiece) => {

    const [stage, setStage] = useState(createStage());
    const [rowsCleared, setRowsCleared] = useState(0)

    const addRow = (stage, setStage) => {
        for (let i = 1; i < stage.length; i++)
            stage[i - 1] = [...stage[i]];
        stage[stage.length - 1] = new Array(stage[0].length).fill(["X", ""]);
        setStage(stage);
    };

    useEffect(() => {
        const sweepRows = newStage =>
            newStage.reduce((ack, row) => {
                if (row.findIndex((cell) => cell[0] === 0 || cell[0] === "X") === -1) {
                    setRowsCleared(1);
                    ack.unshift(new Array(newStage[0].length).fill([0, 'clear']));
                    return ack;
                }
                ack.push(row);
                return ack;
            }, [])

        const updateStage = prevStage => {
            const newStage = prevStage.map(row =>
                row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] : cell))
            );

            player.tetromino.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        newStage[y + player.pos.y][x + player.pos.x] = [
                            value,
                            `${player.collided ? 'merged' : 'clear'}`,
                        ];
                    }
                });
            });
            if (player.collided) {
                resetPlayer(pieces, nextPiece);
                return sweepRows(newStage);
            }
            return newStage;
        };
        setStage(prev => updateStage(prev))
    }, [player, resetPlayer])

    return [addRow, stage, setStage, rowsCleared, setRowsCleared, player]
}