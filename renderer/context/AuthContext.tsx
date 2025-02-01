import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "next/router";

interface UserData {
  username: string;
  full_name: string;
  // other fields...
}

interface AuthContextType {
  isAuthenticated: boolean;
  userData: UserData | null;
  login: (userData: UserData, userRole: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userData: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

  // Logout the user automatically after the timeout
  const initiateLogoutTimer = () => {
    clearTimeout(timeoutRef.current!);
    timeoutRef.current = setTimeout(() => {
      logout(); // Logout after the session timeout
    }, SESSION_TIMEOUT_MS);
  };

  // Clear the timeout when the component unmounts or when logout is called
  const clearLogoutTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Check if user is authenticated when component mounts
  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    const storedUserData = localStorage.getItem("userData");
    const storedUserRole = localStorage.getItem("userRole");

    if (auth === "true" && storedUserData && storedUserRole) {
      setIsAuthenticated(true);
      setUserData(JSON.parse(storedUserData));
      setUserRole(storedUserRole);
      initiateLogoutTimer();

      if (router.pathname === "/login") {
        router.push("/dashboard");
      }
    } else if (router.pathname !== "/login") {
      router.push("/login");
    }

    // Add event listeners for user activity to reset the timer
    const resetTimer = () => initiateLogoutTimer();
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    return () => {
      clearLogoutTimer();
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [router]);

  const login = (userData: UserData, userRole: string) => {
    setIsAuthenticated(true);
    setUserData(userData);
    setUserRole(userRole);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userData", JSON.stringify(userData));
    localStorage.setItem("userRole", userRole);
    initiateLogoutTimer();
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    setUserRole(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    clearLogoutTimer();
    clearLogoutTimer();
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
