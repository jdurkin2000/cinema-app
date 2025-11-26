import React from "react";
import { render, screen } from "@testing-library/react";
import Navbar from "../Navbar";
// Mock Next.js router to avoid app router invariant during tests
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), prefetch: jest.fn() }),
}));

// Control over useAuth mock
let mockUser: string | null = "Alice";
const mockLogout = jest.fn();

jest.mock("@/app/AuthProvider", () => ({
  useAuth: () => ({ user: mockUser, logout: mockLogout, setUser: jest.fn() }),
}));

// Control token for role
let mockToken: string | null = null;

jest.mock("@/libs/authStore", () => ({
  getToken: () => mockToken,
  clearToken: jest.fn(),
}));

type JwtPayload = { role?: string; name?: string; sub?: string };
function makeJwt(payload: JwtPayload): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    .toString("base64")
    .replace(/=+$/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const body = Buffer.from(JSON.stringify(payload))
    .toString("base64")
    .replace(/=+$/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${header}.${body}.sig`;
}

describe("Navbar", () => {
  beforeEach(() => {
    mockUser = "Alice";
    mockToken = null;
    mockLogout.mockClear();
  });

  it("shows welcome with user name when logged in (non-admin)", () => {
    render(<Navbar />);
    expect(screen.getByText(/Welcome, Alice/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Edit Profile/i })
    ).toBeInTheDocument();
    expect(screen.queryByText(/Admin Homepage/i)).not.toBeInTheDocument();
  });

  it("shows admin homepage link when role is ADMIN", () => {
    mockToken = makeJwt({ role: "ADMIN" });
    render(<Navbar />);
    expect(
      screen.getByRole("link", { name: /Admin Homepage/i })
    ).toBeInTheDocument();
    // In admin view we do not show the welcome label
    expect(screen.queryByText(/Welcome, Alice/i)).not.toBeInTheDocument();
  });

  it("shows sign in/register when no user", () => {
    mockUser = null;
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /Sign in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Register/i })).toBeInTheDocument();
  });
});
