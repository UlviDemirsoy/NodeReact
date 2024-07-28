import { useRef, useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import icon from "../icon.png";
import axios from "../api/axios";
const LOGIN_URL = "/account/login";

const Login = () => {
  const { setAuth } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    userRef.current.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        LOGIN_URL,
        JSON.stringify({ email, password }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const accessToken = response?.data?.user?.stsTokenManager?.accessToken;
      const uid = response?.data?.user?.uid;
      setAuth({ email, uid, accessToken });
      navigate(from, { replace: true });
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 400) {
        setErrMsg("Invalid Email or Password");
      } else if (err.response?.status === 401) {
        setErrMsg("Unauthorized");
      } else {
        setErrMsg("Login Failed");
      }
      errRef.current.focus();
    }
  };

  return (
    <div className={"mainContainer"}>
      <div className={"titleContainer"}>
        <img src={icon} alt="logo" />
      </div>
      <div className={"titleContainer"}>Please sign in</div>

      <p
        ref={errRef}
        className={errMsg ? "errmsg" : "offscreen"}
        aria-live="assertive"
        color="#EA4F6C"
      >
        {errMsg}
      </p>

      <div className={"inputContainer"}>
        <input
          className={"inputBox"}
          type="text"
          id="username"
          ref={userRef}
          autoComplete="off"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="E-mail address"
          required
        />
      </div>

      <div className={"inputContainer"}>
        <input
          className={"inputBox"}
          type="password"
          id="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder="Password"
          required
        />
      </div>

      <div className={"inputContainer"}>
        <input
          className={"inputButton"}
          type="button"
          onClick={handleSubmit}
          value={"Sign in"}
        />
      </div>

      <div className={"inputContainer"}>
        <input
          className={"inputButton"}
          type="button"
          onClick={() => {navigate("/register", {
            state: { from: location },
            replace: true,
          });}}
          value={"Register"}
        />
      </div>
    </div>
  );
};

export default Login;