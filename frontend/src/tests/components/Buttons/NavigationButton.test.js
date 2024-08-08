import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import NavigationButton from '../../../components/Buttons/NavigationButton';

// Mock the utility functions
jest.mock('../../../utils/utils', () => ({
  scrollLeft: jest.fn(),
  scrollRight: jest.fn(),
}));

// Import the mocked functions
import { scrollLeft, scrollRight } from '../../../utils/utils';

describe('NavigationButton Component', () => {
  const mockSetCanScrollAutomatic = jest.fn();
  const mockContainerRef = { current: null };

  beforeEach(() => {
    render(
      <NavigationButton
        setCanScrollAutomatic={mockSetCanScrollAutomatic}
        containerRef={mockContainerRef}
      />
    );
  });

  test('renders navigation buttons', () => {
    expect(screen.getByText('<')).toBeInTheDocument();
    expect(screen.getByText('>')).toBeInTheDocument();
  });

  test('calls scrollLeft and setCanScrollAutomatic on left button click', () => {
    const leftButton = screen.getByText('<');
    fireEvent.click(leftButton);
    expect(scrollLeft).toHaveBeenCalledWith(mockContainerRef);
    expect(mockSetCanScrollAutomatic).toHaveBeenCalledWith(false);
  });

  test('calls scrollRight and setCanScrollAutomatic on right button click', () => {
    const rightButton = screen.getByText('>');
    fireEvent.click(rightButton);
    expect(scrollRight).toHaveBeenCalledWith(mockContainerRef);
    expect(mockSetCanScrollAutomatic).toHaveBeenCalledWith(false);
  });
});
