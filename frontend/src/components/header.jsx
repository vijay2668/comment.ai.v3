import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { toast } from "react-hot-toast";

export const Header = ({ children, isLoggedIn, setIsLoggedIn }) => {
  // for logoutting the user
  const handleLogout = () => {
    setIsLoggedIn(false);
    googleLogout();
    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    toast.success("Logged out successfully");
  };

  //this is a google login execute function
  const handleLogin = useGoogleLogin({
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/youtube.force-ssl",
    ].join(" "),
    onSuccess: async ({ code }) => {
      try {
        const tokens = await axios
          .post("http://localhost:5000/api/auth", {
            code,
          })
          .then((res) => res.data);
        // console.log("tokens", tokens);

        // Save access token with expiry date and refresh token into cookies
        const { access_token, refresh_token, expiry_date } = tokens;

        document.cookie = `access_token=${access_token}; expires=${new Date(expiry_date).toUTCString()}; path=/`;
        document.cookie = `refresh_token=${refresh_token}; path=/`;

        setIsLoggedIn(true);
        toast.success("Logged in successfully");
      } catch (err) {
        toast.error(err.message);
      }
    },
    flow: "auth-code",
    onError: (err) => {
      console.log(err);
      toast.error(err);
    },
  });

  return (
    <div className="flex h-full w-full flex-col">
      <header className="flex h-fit w-full p-4">
        <button
          onClick={isLoggedIn ? handleLogout : handleLogin}
          className="ml-auto rounded-full bg-blue-600 px-4 py-2 text-white"
        >
          {isLoggedIn ? "Logout" : "Login"}
        </button>
      </header>
      {children}
    </div>
  );
};
