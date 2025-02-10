import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../screens/login";
import { useAuth } from "../context/AuthContext";
import { loginUser, registerUser } from "../api";
import { NavigationProp } from "@react-navigation/native";

// Mock dependencies
jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../api", () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn(),
}));

// Mock navigation prop
const mockNavigation: Partial<NavigationProp<any>> = {
  navigate: jest.fn(),
};

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      userToken: null,
      storeToken: jest.fn(),
      setUserObjectId: jest.fn(),
      establishEventServerConnection: jest.fn(),
    });
  });

  test("logs in when credentials are entered and login button is pressed", async () => {
    (loginUser as jest.Mock).mockResolvedValue({ token: "mockToken", userID: "12345" });

    const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={mockNavigation as any} />);

    fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "password123");

    fireEvent.press(getByText("Login"));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith("test@example.com", "password123");
      expect(useAuth().storeToken).toHaveBeenCalledWith("mockToken");
      expect(useAuth().setUserObjectId).toHaveBeenCalledWith("12345");
      expect(useAuth().establishEventServerConnection).toHaveBeenCalledWith("12345", "mockToken");
    });
  });

  test("registers when email and password are entered and register button is pressed", async () => {
    (registerUser as jest.Mock).mockResolvedValue({ success: true });

    const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={mockNavigation as any} />);

    fireEvent.changeText(getByPlaceholderText("Email"), "newuser@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "newpassword");

    fireEvent.press(getByText("Register"));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith("newuser@example.com", "newpassword");
    });
  });

  test("navigates to Home when userToken is available", () => {
    (useAuth as jest.Mock).mockReturnValue({
      userToken: "mockToken",
      storeToken: jest.fn(),
      setUserObjectId: jest.fn(),
      establishEventServerConnection: jest.fn(),
    });

    render(<LoginScreen navigation={mockNavigation as any} />);

    expect(mockNavigation.navigate).toHaveBeenCalledWith("Home");
  });
});
