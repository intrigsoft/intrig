import { render } from '@testing-library/react';

import ReactSamples from './react-samples';

describe('ReactSamples', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ReactSamples />);
    expect(baseElement).toBeTruthy();
  });
});
