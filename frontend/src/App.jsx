import "./App.css";
import { useEffect, useState } from "react";
import { LoginPage } from "./components/login";
import { MainPage } from "./components/main";
import { googleLogout } from "@react-oauth/google";
import { getCookie } from "./helpers";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = async () => {
    // Your logout logic here
    setIsLoggedIn(false);
    googleLogout();
  };

  //this useffect checks if user access token is expired or not
  useEffect(() => {
    const accessTokenCookie = getCookie("access_token");
    if (!accessTokenCookie) {
      handleLogout();
    } else {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div>
      {isLoggedIn ? (
        <div className="relative w-full">
          <button
            className="absolute right-5 top-5 rounded-md border border-black p-1.5 hover:bg-red-300"
            onClick={handleLogout}
          >
            Logout
          </button>
          <MainPage />
        </div>
      ) : (
        <LoginPage setIsLoggedIn={setIsLoggedIn} />
      )}
    </div>
  );
};
export default App;
