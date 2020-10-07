import React from 'react';

import { StyledButton } from './styles/StyledButton'

const StartButton = ({ callback }) => (
  <StyledButton onClick={callback}>Start Game</StyledButton>
);

export default StartButton;
