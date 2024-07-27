import { useGoogleLogin } from "@react-oauth/google";
import GoogleButton from "react-google-button";
import axios from "axios";
import { backend_url } from "../helpers";

export const LoginPage = ({ setIsLoggedIn }) => {
  //this is a google login execute function

  const login = useGoogleLogin({
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/youtube.force-ssl",
    ].join(" "),
    onSuccess: async (tokenResponse) => {
      // Save access token and expires in to cookies
      // console.log(tokenResponse);
      const accessToken = tokenResponse.access_token;
      const expiresIn = tokenResponse.expires_in;
      const expiresAt = new Date(Date.now() + expiresIn * 1000);
      document.cookie = `access_token=${accessToken}; expires=${expiresAt.toUTCString()}; path=/`;
      // Use the access token to get the user's profile information
      const userData = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ).then((response) => response.json());

      const user = await axios
        .post(`${backend_url}/api/auth/login`, userData)
        .then((res) => res.data);

      // console.log("userData", userData);
      // console.log("user", user);
      // Use the user's profile information
      setIsLoggedIn(true);
    },
    onError: (err) => {
      console.log(err);
      alert(err);
    },
  });

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <GoogleButton onClick={login} type="light" />
    </div>
  );
};
