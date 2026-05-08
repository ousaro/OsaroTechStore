import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ShippingAddress from '../../../ui/components/PlaceOrderComponents/ShippingAddress';

describe('ShippingAddress Component', () => {
  const mockSetShippingAddress = jest.fn();
  const initialShippingAddress = {
    addressLine: '',
    city: '',
    postalCode: '',
    country: ''
  };

  const renderShippingAddress = () => {
    render(
      <ShippingAddress
        shippingAddress={initialShippingAddress}
        setShippingAddress={mockSetShippingAddress}
      />
    );
  };

  test('renders Shipping Address form', () => {
    renderShippingAddress();

    expect(screen.getByText(/Shipping Address/i)).toBeInTheDocument();
  });

  test('updates address field', () => {
    renderShippingAddress();

    const addressInput = screen.getByPlaceholderText('Enter your address');
    fireEvent.change(addressInput, { target: { value: '123 Main St' } });
    expect(mockSetShippingAddress).toHaveBeenCalledWith({
      ...initialShippingAddress,
      addressLine: '123 Main St'
    });
  });

  test('updates city field', () => {
    renderShippingAddress();

    const cityInput = screen.getByPlaceholderText('Enter your city');
    fireEvent.change(cityInput, { target: { value: 'New York' } });
    expect(mockSetShippingAddress).toHaveBeenCalledWith({
      ...initialShippingAddress,
      city: 'New York'
    });
  });

  test('updates postal code field', () => {
    renderShippingAddress();

    const postalCodeInput = screen.getByPlaceholderText('20330');
    fireEvent.change(postalCodeInput, { target: { value: '12345' } });
    expect(mockSetShippingAddress).toHaveBeenCalledWith({
      ...initialShippingAddress,
      postalCode: '12345'
    });
  });

  test('updates country field', () => {
    renderShippingAddress();

    const countryInput = screen.getByPlaceholderText('Enter your County');
    fireEvent.change(countryInput, { target: { value: 'USA' } });
    expect(mockSetShippingAddress).toHaveBeenCalledWith({
      ...initialShippingAddress,
      country: 'USA'
    });
  });
});
