import React from 'react';

import Cell from './Cell';

import { StyledStage } from './styles/StyledStage'

const Stage = ({ stage, id }) => (
    id === 1 ?

        <StyledStage width={stage[0].length} height={stage.length}>
            {stage.map(row => row.map((cell, x) => <Cell key={x} type={cell[0]} />))}
        </StyledStage>
        : stage ?
            <StyledStage width={stage[0].length} height={stage.length}>
                {stage.map(row => row.map((cell, x) => <Cell key={x} type={cell[0]} />))}
            </StyledStage>
            :
            null

);

export default Stage;