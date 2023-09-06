import GeneralButton from "../components/GeneralButton";
import radiuses from "../style-utils/radiuses";
import colors from "../style-utils/colors";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import paddings from "../style-utils/paddings";
import borders from "../style-utils/borders";
import { loginActions } from "../store/login-slice";
import { ptdActions } from "../store/puzzle-to-display-slice";
import MiniEightsPuzzle from "./MiniEightsPuzzle";
import MiniSudoku from "./MiniSudoku";
import MiniHashi from "./MiniHashi";
import margins from "../style-utils/margins";
import text_styles from "../style-utils/text_styles";

const SearchedPuzzleInfo = (props) => {
  const {
    puzzle,
    puzzleType,
    setLeftNavigationChoice,
    setIsHoveringResults,
    setSearchInput,
    recentSearchedPuzzle,
    searchPuzzle,
  } = props;

  //console.log("Puzzle is:", puzzle);

  const dispatch = useDispatch();

  return (
    <PuzzleInfo
      recentSearchedPuzzle={recentSearchedPuzzle}
      puzzleType={puzzleType}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "baseline",
          justifyContent: "space-evenly",
          width: "40%",
          height: "100%",
        }}
      >
        <div>
          <b>Puzzle ID</b>: {puzzle._id}
        </div>
        <div>
          <b>Creator ID</b>: {puzzle["creator-id"]}
        </div>
        <div>
          <b>Difficulty</b>: {puzzle.difficulty}{" "}
          {puzzle.difficulty < 4
            ? "(Easy)"
            : puzzle.difficulty < 8
            ? "(Medium)"
            : "(Hard)"}
        </div>
        <div>
          <b>Status</b>: {puzzle.active ? "Active" : "Not Active"}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        {puzzleType === "eights_puzzle" && (
          <MiniEightsPuzzle
            puzzle={puzzle.values}
            gridStyleExtra={{
              width: "90%",
              height: "100%",
              marginRight: margins.lrg,
            }}
            numberStyleExtra={{
              fontSize: text_styles.resizbale_font.med,
              color: "black",
            }}
          />
        )}
        {puzzleType === "sudoku" && (
          <MiniSudoku
            selectedNumbers={puzzle.values}
            gridSize={3}
            gridStyleExtra={{
              width: "90%",
              height: "100%",
              marginRight: margins.lrg,
            }}
            numberStyleExtra={{
              fontSize: text_styles.resizbale_font.small,
              color: "black",
            }}
          />
        )}
        {puzzleType === "hashi" && (
          <MiniHashi
            puzzleHeight={puzzle.values.length}
            puzzleWidth={puzzle.values[0].length}
            puzzle={puzzle.values}
            gridStyleExtra={{
              
              marginRight: margins.lrg,
            }}
            numberStyleExtra={{ fontSize: text_styles.resizbale_font.small }}
          />
        )}
      </div>
      <GeneralButton
        label={"View"}
        handleButtonPress={async () => {
          setLeftNavigationChoice((prev) => {
            if (prev === "messages") dispatch(loginActions.updateMessages());
            return "display-searched-puzzle";
          });
          dispatch(ptdActions.setShowPuzzle(true));
          setIsHoveringResults(false);
          setSearchInput("");

          if (recentSearchedPuzzle) {
            dispatch(ptdActions.setIsFetchingPuzzle(true));
            await searchPuzzle(puzzle._id, puzzleType);
            dispatch(ptdActions.setSearchPuzzleType(puzzleType));
            dispatch(ptdActions.setIsFetchingPuzzle(false));
          }
        }}
      />
    </PuzzleInfo>
  );
};

const PuzzleInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  color: #${colors.darkerChocolate};
  width: 98%;
  border: ${borders.med}px solid #${colors.chocolate};
  padding: ${paddings.xxsmall}vw;
  box-sizing: border-box;
  border-radius: ${radiuses.med}px;
  gap: 1vw;
  margin: auto;
  height: ${(props) =>
    props.recentSearchedPuzzle
      ? props.puzzleType === "hashi"
        ? "55vh"
        : "36vh"
      : props.puzzleType === "hashi"
      ? "55vh"
      : "36vh"};
`;

export default SearchedPuzzleInfo;
