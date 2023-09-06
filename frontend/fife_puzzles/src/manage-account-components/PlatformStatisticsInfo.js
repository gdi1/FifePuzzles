import margins from "../style-utils/margins";
import radiuses from "../style-utils/radiuses";
import borders from "../style-utils/borders";
import colors from "../style-utils/colors";
import paddings from "../style-utils/paddings";
import styled from "styled-components";
import React, { useRef, useState, useEffect } from "react";
import { ScrollView } from "react-native";
import text_styles from "../style-utils/text_styles";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { psActions } from "../store/platform-statistics-slice";
import UserActivityChartContainer from "./UserActivityChartContainer";
import SolvedPuzzlesTypeChartContainer from "./SolvedPuzzlesTypeChartContainer";
import SolvedPuzzlesDifficultyChartContainer from "./SolvedPuzzlesDifficultyChartContainer";

const PlatformStatisticsInfo = (props) => {
  const dispatch = useDispatch();
  const { currentNumberOfUsers } = useSelector(
    (state) => state.platformStatistics.userActivity
  );

  const getUserCounts = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}user-counts/`,
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
      console.log("User statistics:", data);
      dispatch(psActions.setUserActivity(data));
    }
  };

  const getSolvedPuzzlesType = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}solved-puzzles/type`,
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
      console.log("Solved puzzles type:", data);
      dispatch(psActions.setPuzzleTypeActivity(data));
    }
  };

  const getSolvedPuzzlesDifficulty = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}solved-puzzles/difficulty`,
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
      console.log("Solved puzzles difficulty:", data);
      dispatch(psActions.setPuzzleDifficultyActivity(data));
    }
  };

  useEffect(() => {
    getUserCounts();
    getSolvedPuzzlesType();
    getSolvedPuzzlesDifficulty();
  }, []);

  return (
    <React.Fragment>
      <TitleInfoBlock>Platform Statistics</TitleInfoBlock>
      <ScrollView
        style={{
          display: "flex",
          flexDirection: "column",
          height: 100,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: `${text_styles.resizbale_font.med}`,
            padding: `${paddings.xxsmall}vw`,
            color: `#${colors.creme}`,
          }}
        >
          No. of users on platform: {currentNumberOfUsers}
        </div>
        <UserActivityChartContainer />
        <SolvedPuzzlesTypeChartContainer />
        <SolvedPuzzlesDifficultyChartContainer />
      </ScrollView>
    </React.Fragment>
  );
};

const PlatformStats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: baseline;
  color: #${colors.creme};
  width: 95%;
  margin: ${margins.xxsmall}vw ${margins.xxsmall}vw;
  border: ${borders.med}px solid #${colors.creme};
  padding: ${paddings.xxsmall}vw;
  box-sizing: border-box;
  border-radius: ${radiuses.med}px;
`;

const TitleInfoBlock = styled.div`
  color: #bca38f;
  font-size: ${text_styles.resizbale_font.lrg};
  font-weight: bold;
  display: flex;
  justify-content: center;
  padding-bottom: ${paddings.xxsmall}vw;
  border-bottom: ${borders.med}px solid #bca38f;
`;

export default PlatformStatisticsInfo;
