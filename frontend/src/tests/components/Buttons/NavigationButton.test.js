import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import NavigationButton from '../../../ui/components/Buttons/NavigationButton';
import { scrollLeft, scrollRight } from '../../../shared/utils/utils';

// Mock the utility functions
jest.mock('../../../shared/utils/utils', () => ({
  scrollLeft: jest.fn(),
  scrollRight: jest.fn(),
}));

describe('NavigationButton Component', () => {
  const mockSetCanScrollAutomatic = jest.fn();
  const mockContainerRef = { current: null };

  const renderNavigationButton = () => {
    render(
      <NavigationButton
        setCanScrollAutomatic={mockSetCanScrollAutomatic}
        containerRef={mockContainerRef}
      />
    );
  };

  test('renders navigation buttons', () => {
    renderNavigationButton();

    expect(screen.getByText('<')).toBeInTheDocument();
    expect(screen.getByText('>')).toBeInTheDocument();
  });

  test('calls scrollLeft and setCanScrollAutomatic on left button click', () => {
    renderNavigationButton();

    const leftButton = screen.getByText('<');
    fireEvent.click(leftButton);
    expect(scrollLeft).toHaveBeenCalledWith(mockContainerRef);
    expect(mockSetCanScrollAutomatic).toHaveBeenCalledWith(false);
  });

  test('calls scrollRight and setCanScrollAutomatic on right button click', () => {
    renderNavigationButton();

    const rightButton = screen.getByText('>');
    fireEvent.click(rightButton);
    expect(scrollRight).toHaveBeenCalledWith(mockContainerRef);
    expect(mockSetCanScrollAutomatic).toHaveBeenCalledWith(false);
  });
});
