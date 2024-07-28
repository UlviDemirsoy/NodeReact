import { useRef, useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import icon from "../icon.png";

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%.]).{8,24}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9]+@(?:[a-zA-Z0-9]+\.)+[A-Za-z]+$/;
const REGISTER_URL = "/account";

const Register = () => {
  const userRef = useRef();
  const errRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [success, setSuccess] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        REGISTER_URL,
        JSON.stringify({ name, email, password }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setSuccess(true);
      navigate("/login", {
        state: { from: location },
        replace: true,
      });
    } catch (err) {
      if (!err?.response) {
        setErrMsg(!err?.response);
      } else if (err.response?.status === 409) {
        setErrMsg("Username in use");
      } else {
        setErrMsg("Registration Failed");
      }
      errRef.current.focus();
    }
  };

  return (
    <div className={"mainContainer"}>
       <div className={"titleContainer"}>
        <img src={icon} alt="logo" />
      </div>
      <div className={"titleContainer"}>Register</div>
      <p
        ref={errRef}
        className={errMsg ? "errmsg" : "offscreen"}
        aria-live="assertive"
        color="#EA4F6C"
      >
        {errMsg}
      </p>
      <div>
        <div className={"inputContainer"}>
          <input
            className={"inputBox"}
            type="text"
            id="username"
            ref={userRef}
            placeholder="Name"
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
        </div>
        <div className={"inputContainer"}>
          <input
            className={"inputBox"}
            type="text"
            id="email"
            ref={userRef}
            autoComplete="off"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail Address"
            value={email}
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
            value={"Register"}
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
