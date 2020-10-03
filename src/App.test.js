import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

import Tetris from './components/Tetris';

test('renders learn react link', () => {
  const { getByText } = render(<Tetris />);
  const linkElement = getByText(/Start Game/i);
  expect(linkElement).toBeInTheDocument();
});
