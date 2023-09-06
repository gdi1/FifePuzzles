import margins from "../style-utils/margins";
import radiuses from "../style-utils/radiuses";
import borders from "../style-utils/borders";
import colors from "../style-utils/colors";
import paddings from "../style-utils/paddings";
import styled from "styled-components";
import CircularProgress from "@mui/material/CircularProgress";
import React, { useRef, useState, useEffect } from "react";
import { ScrollView } from "react-native";
import text_styles from "../style-utils/text_styles";
import { useSelector } from "react-redux";
import RequestInfoBlock from "./RequestInfoBlock";
import { fpActions } from "../store/flagged-puzzles-slice";
import { useDispatch } from "react-redux";
import FlaggedPuzzleInfoBlock from "./FlaggedPuzzleInfoBlock";

const FlaggedPuzzlesInfo = (props) => {
  const dispatch = useDispatch();
  const [showLoading, setShowLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(true);

  const { flaggedPuzzles, currentLength, totalLength } = useSelector(
    (state) => state.flaggedPuzzles
  );

  const loadingRef = useRef(null);

  const getNewBatch = async (skip) => {
    console.log("Skip is", skip);
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}flagged-puzzles/active/skip/${skip}`,
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
      const { flaggedPuzzles, batchSize } = data;
      console.log(flaggedPuzzles);
      if (flaggedPuzzles.length !== 0) {
        dispatch(fpActions.addEarlierFlaggedPuzzles(flaggedPuzzles));
        setIsFetching(false);
        if (flaggedPuzzles.length < batchSize) {
          setShowLoading(false);
        }
      } else {
        setShowLoading(false);
      }
    }
  };

  const onVisibilityChange = async (entries) => {
    console.log(entries[0].isIntersecting);
    console.log("New intersection");

    if (entries[0].isIntersecting) {
      if (totalLength === 0) setShowLoading(false);
      else {
        console.log(isFetching);
        if (!isFetching) setIsFetching(true);
      }
    }
  };

  useEffect(() => {
    if (loadingRef.current) {
      const observer = new IntersectionObserver(onVisibilityChange);
      console.log(loadingRef.current);
      observer.observe(loadingRef.current);
    }
  }, [isFetching]);

  useEffect(() => {
    if (isFetching) {
      console.log("inside another useeffect");
      getNewBatch(currentLength);
    }
  }, [isFetching]);

  return (
    <React.Fragment>
      <TitleInfoBlock>Flagged Puzzles</TitleInfoBlock>
      <ScrollView
        style={{
          display: "flex",
          flexDirection: "column",
          height: 100,
        }}
      >
        {flaggedPuzzles.map((flaggedPuzzle) => (
          <FlaggedPuzzleInfoBlock
            flaggedPuzzleInfo={flaggedPuzzle}
            key={flaggedPuzzle._id}
          ></FlaggedPuzzleInfoBlock>
        ))}
        {!showLoading && totalLength === 0 && (
          <TitleInfoBlock
            style={{
              fontSize: `${text_styles.resizbale_font.med}`,
              borderBottom: "none",
              marginTop: `${margins.xsmall}vw`,
            }}
          >
            No new flagged puzzles.
          </TitleInfoBlock>
        )}
        {showLoading && (
          <div
            style={{
              marginTop: margins.med,
              marginBottom: margins.lrg,
              display: "flex",
              width: "inherit",
              justifyContent: "center",
            }}
            ref={loadingRef}
          >
            <CircularProgress
              style={{ width: 50, height: 50, color: `#${colors.creme}` }}
              color={"inherit"}
            />
          </div>
        )}
      </ScrollView>
    </React.Fragment>
  );
};

export const TitleInfoBlock = styled.div`
  color: #bca38f;
  font-size: ${text_styles.resizbale_font.lrg};
  font-weight: bold;
  display: flex;
  justify-content: center;
  padding-bottom: ${paddings.xxsmall}vw;
  border-bottom: ${borders.med}px solid #bca38f;
`;

export default FlaggedPuzzlesInfo;
