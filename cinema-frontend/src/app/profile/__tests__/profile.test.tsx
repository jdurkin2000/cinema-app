import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Profile from "../page";

// Mock router
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock auth store token
jest.mock("@/libs/authStore", () => ({
  getToken: () => "test-token",
  clearToken: jest.fn(),
}));

// Capture setUser calls
const setUserMock = jest.fn();

jest.mock("@/app/AuthProvider", () => ({
  useAuth: () => ({ setUser: setUserMock }),
}));

// Mock API
jest.mock("@/libs/authApi", () => ({
  me: async () => ({
    name: "Old Name",
    email: "user@example.com",
    promotionsOptIn: false,
    address: { line1: "123 A", city: "Town", state: "GA", zip: "30602" },
    paymentCards: [],
  }),
  updateProfile: async () => ({}),
  addCard: async () => ({}),
  changePassword: async () => ({}),
  removeCard: async () => ({}),
  updateCard: async () => ({}),
}));

describe("Profile page", () => {
  beforeEach(() => {
    setUserMock.mockClear();
  });

  it("updates AuthProvider user after successful save", async () => {
    render(<Profile />);

    // Wait for initial data load
    const nameInput = await screen.findByPlaceholderText("Full name");
    expect((nameInput as HTMLInputElement).value).toBe("Old Name");

    // Change name and required address fields
    fireEvent.change(nameInput, { target: { value: "New Name" } });
    fireEvent.change(screen.getByPlaceholderText("Address line 1"), {
      target: { value: "456 B" },
    });
    fireEvent.change(screen.getAllByPlaceholderText("City")[0], {
      target: { value: "City" },
    });
    fireEvent.change(screen.getAllByPlaceholderText("State")[0], {
      target: { value: "NY" },
    });
    fireEvent.change(screen.getAllByPlaceholderText("ZIP")[0], {
      target: { value: "10001" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(setUserMock).toHaveBeenCalledWith("New Name");
    });
  });
});
