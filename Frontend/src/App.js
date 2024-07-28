import "./App.css";
import Login from "./components/Login";
import { Routes, Route } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";
import Register from "./components/Register";
import Home from "./components/Home";
import Favorites from "./components/Favorites";
import User
 from "./components/User";
function App() {
  return (
    <Routes>
    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />} />
    <Route element={<RequireAuth />}>
      <Route path="/" element={<Home />} />
      <Route path="favorites" element={<Favorites />} />
      <Route path="user" element={<User />} />
    </Route>
  </Routes>
  );
}

export default App;
