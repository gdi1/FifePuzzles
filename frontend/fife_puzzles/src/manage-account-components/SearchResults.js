import radiuses from "../style-utils/radiuses";
import colors from "../style-utils/colors";
import styled from "styled-components";
import React, { useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import margins from "../style-utils/margins";
import paddings from "../style-utils/paddings";
import borders from "../style-utils/borders";
import { utdActions } from "../store/user-to-display-slice";
import GeneralButton from "../components/GeneralButton";
import { loginActions } from "../store/login-slice";
import text_styles from "../style-utils/text_styles";
import { useState } from "react";
import { ptdActions } from "../store/puzzle-to-display-slice";
import CircularProgress from "@mui/material/CircularProgress";
import SearchedUserInfo from "./SearchedUserInfo";
import SearchedPuzzleInfo from "./SearchedPuzzleInfo";

const SearchResults = (props) => {
  const searchRes = useRef();

  const {
    setIsHoveringResults,
    searchCategory,
    searchInput,
    searchIconRef,
    usersButtonRef,
    puzzlesButtonRef,
    searchInputRef,
    setLeftNavigationChoice,
    setSearchInput,
  } = props;

  const [isFetching, setIsFetching] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.userToDisplay);
  const { puzzleType } = useSelector((state) => state.puzzleToDisplay.search);
  const { puzzle } = useSelector((state) => state.puzzleToDisplay);
  const { recentSearchedUsers, recentSearchedPuzzles } = useSelector(
    (state) => state.login
  );
  console.log(recentSearchedPuzzles);

  const searchUser = async (userID) => {
    console.log(userID);
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}users/${userID}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        credentials: "include",
      }
    );
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      dispatch(utdActions.setUserToDisplay(data.data));
    } else {
      dispatch(utdActions.resetUserToDisplay());
      console.log("No user with this id");
    }
    setIsFetching(false);
  };

  const searchPuzzle = async (puzzleID, puzzleType) => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}users/puzzle?puzzleID=${puzzleID}&puzzleType=${puzzleType}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        credentials: "include",
      }
    );
    if (response.ok) {
      const { data } = await response.json();
      console.log(data);
      dispatch(ptdActions.setSearchPuzzle(data));
    } else {
      console.log("Smth went wrong");
      dispatch(ptdActions.resetPuzzleToDisplay());
    }
    setIsFetching(false);
  };

  const getRecentSearchedUsers = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}users/recent-searched-users`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        credentials: "include",
      }
    );

    if (response.ok) {
      const { data } = await response.json();
      console.log(data);
      dispatch(loginActions.setRecentSearchedUsers(data.recentSearchedUsers));
    }
    setIsFetching(false);
  };

  const getRecentSearchedPuzzles = async () => {
    console.log("Heloooo");
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}users/recent-searched-puzzles`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        credentials: "include",
      }
    );

    if (response.ok) {
      const { data } = await response.json();
      console.log("Data is:", data);
      dispatch(
        loginActions.setRecentSearchedPuzzles(data.recentSearchedPuzzles)
      );
    }
    setIsFetching(false);
  };

  useEffect(() => {
    if (searchInput.trim() !== "") {
      if (searchCategory === "users" && (!user || user._id !== searchInput)) {
        setIsFetching(true);
        searchUser(searchInput.trim());
      } else if (searchCategory === "puzzles") {
        setIsFetching(true);
        searchPuzzle(searchInput.trim(), puzzleType);
      }
    }
  }, [searchInput, searchCategory, puzzleType]);

  useEffect(() => {
    if (searchInput.trim() === "") {
      if (searchCategory === "users") {
        setIsFetching(true);
        getRecentSearchedUsers();
      } else if (searchCategory === "puzzles") {
        setIsFetching(true);
        getRecentSearchedPuzzles();
      }
    }
  }, [searchInput, searchCategory]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchRes.current &&
        !(
          searchRes.current.contains(event.target) ||
          searchIconRef.current.contains(event.target) ||
          searchInputRef.current.contains(event.target) ||
          usersButtonRef.current.contains(event.target) ||
          puzzlesButtonRef.current.contains(event.target)
        )
      ) {
        console.log("Pressed outside search results");
        setIsHoveringResults(false);
      } else if (
        searchRes.current &&
        searchIconRef.current &&
        (searchRes.current.contains(event.target) ||
          searchIconRef.current.contains(event.target) ||
          searchInputRef.current.contains(event.target) ||
          usersButtonRef.current.contains(event.target) ||
          puzzlesButtonRef.current.contains(event.target))
      ) {
        console.log("Pressed inside search results");
        setIsHoveringResults(true);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRes]);

  return (
    <React.Fragment>
      {!isFetching && (
        <Results ref={searchRes} searchCategory={searchCategory}>
          {searchCategory === "users" && user && searchInput !== "" && (
            <React.Fragment>
              <Title>Results</Title>
              <SearchedUserInfo
                user={user}
                setIsHoveringResults={setIsHoveringResults}
                setLeftNavigationChoice={setLeftNavigationChoice}
                setSearchInput={setSearchInput}
              />
            </React.Fragment>
          )}
          {searchCategory === "users" &&
            ((!user && searchInput !== "") ||
              (recentSearchedUsers.length === 0 && searchInput === "")) && (
              <Title style={{ marginBottom: "0", height: "100%" }}>
                No user found.
              </Title>
            )}
          {searchCategory === "users" &&
            recentSearchedUsers.length !== 0 &&
            searchInput === "" && (
              <React.Fragment>
                <Title>Recent searches</Title>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    gap: "2vh",
                    boxSizing: "border-box",
                  }}
                >
                  {recentSearchedUsers.map((user) => (
                    <SearchedUserInfo
                      user={user}
                      setIsHoveringResults={setIsHoveringResults}
                      setLeftNavigationChoice={setLeftNavigationChoice}
                      setSearchInput={setSearchInput}
                      recentSearchedUser={true}
                      searchUser={searchUser}
                    />
                  ))}
                </div>
              </React.Fragment>
            )}
          {searchCategory === "puzzles" && (
            <SelectPuzzle
              onChange={(e) => {
                dispatch(ptdActions.resetPuzzleToDisplay());
                dispatch(ptdActions.setSearchPuzzleType(e.target.value));
              }}
            >
              {puzzleType === "sudoku" ? (
                <option value="sudoku" selected>
                  Sudoku
                </option>
              ) : (
                <option value="sudoku">Sudoku</option>
              )}
              {puzzleType === "eights_puzzle" ? (
                <option value="eights_puzzle" selected>
                  Eights Puzzle
                </option>
              ) : (
                <option value="eights_puzzle">Eights Puzzle</option>
              )}
              {puzzleType === "hashi" ? (
                <option value="hashi" selected>
                  Hashi
                </option>
              ) : (
                <option value="hashi">Hashi</option>
              )}
            </SelectPuzzle>
          )}
          {searchCategory === "puzzles" &&
            ((!puzzle && searchInput !== "") ||
              (recentSearchedPuzzles.length === 0 && searchInput === "")) && (
              <Title style={{ marginBottom: "0", height: "100%" }}>
                No puzzle found.
              </Title>
            )}
          {searchCategory === "puzzles" && puzzle && searchInput !== "" && (
            <React.Fragment>
              <Title>Results</Title>
              <SearchedPuzzleInfo
                puzzle={puzzle}
                puzzleType={puzzleType}
                setIsHoveringResults={setIsHoveringResults}
                setLeftNavigationChoice={setLeftNavigationChoice}
                setSearchInput={setSearchInput}
              />
            </React.Fragment>
          )}

          {searchCategory === "puzzles" &&
            recentSearchedPuzzles &&
            recentSearchedPuzzles.length !== 0 &&
            searchInput === "" && (
              <React.Fragment>
                <Title>Recent searches</Title>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    gap: "2vh",
                    marginTop: "2vh",
                  }}
                >
                  {recentSearchedPuzzles.map((puzzle) => (
                    <SearchedPuzzleInfo
                      puzzle={puzzle.puzzle}
                      puzzleType={puzzle.puzzleType}
                      setIsHoveringResults={setIsHoveringResults}
                      setLeftNavigationChoice={setLeftNavigationChoice}
                      setSearchInput={setSearchInput}
                      recentSearchedPuzzle={true}
                      searchPuzzle={searchPuzzle}
                    />
                  ))}
                </div>
              </React.Fragment>
            )}
        </Results>
      )}
      {isFetching && (
        <Results searchCategory={searchCategory}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <CircularProgress
              style={{
                width: 50,
                height: 50,
                color: `#${colors.creme}`,
              }}
              color={"inherit"}
            />
          </div>
        </Results>
      )}
    </React.Fragment>
  );
};

const Results = styled.div`
  background-color: #${colors.lightCreme};
  padding: 1vw;
  height: ${(props) => (props.searchCategory === "users" ? "30vh" : "30vw")};
  position: absolute;
  width: 50vw;
  top: 90%;
  z-index: 1000;
  border-radius: ${radiuses.med}px;
  overflow-y: auto;
  maxheight: 25vw;
  box-sizing: border-box;
`;

const SelectPuzzle = styled.select`
  padding: 1vh;
  display: flex;
  text-align: center;
  font-size: ${text_styles.resizbale_font.small};
  font-weight: bold;
  border: ${borders.med}px solid #${colors.darkerChocolate};
  border-radius: ${radiuses.med}px;
  color: #${colors.lightCreme};
  background-color: #${colors.darkerChocolate};
`;

const Title = styled.div`
  color: #${colors.darkerChocolate};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3vh;
  font-weight: 800;
  margin-bottom: 1vh;
`;
export default SearchResults;
