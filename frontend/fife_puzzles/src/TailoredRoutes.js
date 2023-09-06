import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import RetrieveToken from "./registration-components/RetrieveToken";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordForm";
import NavigationBar from "./components/NavigationBar";
import SudokuScreen from "./screens/SudokuScreen";
import CreateSudokuScreen from "./screens/CreateSudokuScreen";
import SudokuMenuScreen from "./screens/SudokuMenuScreen";
import Home from "../src/screens/Home";
import LoadingScreen from "./screens/LoadingScreen";
import ManageAccountScreen from "./screens/ManageAccountScreen";
import Puzzle8sScreen from "./screens/Puzzle8sScreen";
import Puzzle8sMenuScreen from "./screens/Puzzle8sMenuScreen";
import CreatePuzzle8sScreen from "./screens/CreatePuzzle8sScreen";
import HashiScreen from "./screens/HashiScreen";
import CreateHashiMenuScreen from "./screens/CreateHashiMenuScreen ";
import CreateHashi from "./screens/CreateHashi";
import HashiMenuScreen from "./screens/HashiMenuScreen";
const TailoredRoutes = (props) => {
  const { isLoggedIn } = useSelector((state) => state.login);
  let routes;

  if (isLoggedIn === false) {
    routes = (
      <Routes>
        <Route
          path="/auth/authorize"
          element={<LoginScreen isCrossAuth={true} />}
        />
        <Route path="/retrieveToken/:token" element={<RetrieveToken />} />
        <Route path="/signup" element={<SignUpScreen />} />
        <Route path="/forgotPassword" element={<ForgotPasswordScreen />} />
        <Route
          path="/resetPassword/:resetToken"
          element={<ResetPasswordScreen />}
        />
        <Route path="/login" element={<LoginScreen isCrossAuth={false} />} />
        <Route path="/*" element={<Navigate replace to="/login" />} />
      </Routes>
    );
  } else if (isLoggedIn === true) {
    routes = (
      <Routes>
        <Route
          path="/auth/authorize"
          element={<LoginScreen isCrossAuth={true} />}
        />
        <Route path="/" element={<Home />}></Route>
        <Route path="sudoku" element={<SudokuMenuScreen />}></Route>
        <Route path="sudoku/sudoku_play" element={<SudokuScreen />}></Route>
        <Route path="sudoku_create" element={<CreateSudokuScreen />}></Route>

        <Route path="8s_puzzle" element={<Puzzle8sMenuScreen />}></Route>
        <Route
          path="8s_puzzle/8s_puzzle_play"
          element={<Puzzle8sScreen />}
        ></Route>
        <Route
          path="create_8s_puzzle"
          element={<CreatePuzzle8sScreen />}
        ></Route>

        <Route path="hashi/" element={<HashiMenuScreen />}></Route>
        <Route path="hashi/hashi_play" element={<HashiScreen />}></Route>
        <Route
          path="create_hashi_menu/create_hashi"
          element={<CreateHashi />}
        ></Route>
        <Route
          path="create_hashi_menu"
          element={<CreateHashiMenuScreen />}
        ></Route>

        <Route path="manage_account" element={<ManageAccountScreen />}></Route>
        <Route path="/retrieveToken/:token" element={<RetrieveToken />} />
        <Route path="/*" element={<Navigate replace to="/" />} />
      </Routes>
    );
  } else {
    routes = (
      <Routes>
        <Route path="/*" element={<LoadingScreen />} />
      </Routes>
    );
  }

  return routes;
};

export default TailoredRoutes;
