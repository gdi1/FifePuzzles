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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  PointElement,
} from "chart.js";

import { Bar, Line } from "react-chartjs-2";
import GeneralButton from "../components/GeneralButton";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SolvedPuzzlesTypeChartContainer = (props) => {
  const [buttonPressed, setButtonPressed] = useState("last-week");
  const {
    allPuzzleTypeActivity,
    lastWeekPuzzleTypeActivity,
    lastMonthPuzzleTypeActivity,
    last3MonthsPuzzleTypeActivity,

    lastWeekLabels,
    lastMonthLabels,
    last3MonthsLabels,
    allTimeLabels,
  } = useSelector((state) => state.platformStatistics.puzzleTypeActivity);

  const title = `Solved Puzzles Activity - ${
    buttonPressed === "last-week"
      ? "Last Week"
      : buttonPressed === "last-month"
      ? "Last Month"
      : buttonPressed === "last-3-months"
      ? "Last 3 Months"
      : "All time"
  }`;

  const labels =
    buttonPressed === "last-week"
      ? lastWeekLabels
      : buttonPressed === "last-month"
      ? lastMonthLabels
      : buttonPressed === "last-3-months"
      ? last3MonthsLabels
      : allTimeLabels;

  let dataset_sudoku =
    buttonPressed === "last-week"
      ? lastWeekPuzzleTypeActivity[0]
      : buttonPressed === "last-month"
      ? lastMonthPuzzleTypeActivity[0]
      : buttonPressed === "last-3-months"
      ? last3MonthsPuzzleTypeActivity[0]
      : allPuzzleTypeActivity[0];

  let dataset_eights_puzzles =
    buttonPressed === "last-week"
      ? lastWeekPuzzleTypeActivity[1]
      : buttonPressed === "last-month"
      ? lastMonthPuzzleTypeActivity[1]
      : buttonPressed === "last-3-months"
      ? last3MonthsPuzzleTypeActivity[1]
      : allPuzzleTypeActivity[1];

  let dataset_hashi =
    buttonPressed === "last-week"
      ? lastWeekPuzzleTypeActivity[2]
      : buttonPressed === "last-month"
      ? lastMonthPuzzleTypeActivity[2]
      : buttonPressed === "last-3-months"
      ? last3MonthsPuzzleTypeActivity[2]
      : allPuzzleTypeActivity[2];

  console.log(labels);
  console.log(dataset_sudoku);
  console.log(dataset_eights_puzzles);
  console.log(dataset_hashi);

  const dataBar = {
    labels,
    datasets: [
      {
        label: "#Sudoku",
        data: dataset_sudoku,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "#Eights_Puzzle",
        data: dataset_eights_puzzles,
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "#Hashi",
        data: dataset_hashi,
        backgroundColor: "rgb(75, 192, 192, 0.5)",
      },
    ],
  };

  const dataLine = {
    labels,
    datasets: [
      {
        fill: true,
        label: "#Sudoku",
        data: dataset_sudoku,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgb(255, 99, 132)",
      },
      {
        fill: true,
        label: "#Eights_Puzzle",
        data: dataset_eights_puzzles,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        fill: true,
        label: "#Hashi",
        data: dataset_eights_puzzles,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgb(75, 192, 192, 0.5)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      y: {
        stacked: true,
        ticks: {
          stepSize: 1,
        },
        beginAtZero: true,
        title: {
          display: true,
          text: "#Puzzles",
        },
      },
      x: {
        stacked: true,
        ticks: {
          autoSkip: true,
          maxTicksLimit: 20,
        },
      },
    },
  };

  return (
    <React.Fragment>
      <ChartContainer>
        <TitleInfoBlock>Solved Puzzles Activity by Type</TitleInfoBlock>
        <Chart>
          {(buttonPressed === "last-week" ||
            buttonPressed === "last-month") && (
            <Bar options={options} data={dataBar} />
          )}
          {(buttonPressed === "last-3-months" ||
            buttonPressed === "all-time") && (
            <React.Fragment>
              <Line options={options} data={dataLine} />
            </React.Fragment>
          )}
        </Chart>
        <ButtonGroup>
          <GeneralButton
            label={"Last week"}
            style={{
              backgroundColor: `#${
                buttonPressed === "last-week"
                  ? colors.darkChocolate
                  : colors.creme
              }`,
            }}
            handleButtonPress={() => {
              setButtonPressed("last-week");
            }}
          ></GeneralButton>
          <GeneralButton
            style={{
              backgroundColor: `#${
                buttonPressed === "last-month"
                  ? colors.darkChocolate
                  : colors.creme
              }`,
            }}
            label={"Last month"}
            handleButtonPress={() => {
              setButtonPressed("last-month");
            }}
          ></GeneralButton>
          <GeneralButton
            style={{
              backgroundColor: `#${
                buttonPressed === "last-3-months"
                  ? colors.darkChocolate
                  : colors.creme
              }`,
            }}
            label={"Last 3 months"}
            handleButtonPress={() => {
              setButtonPressed("last-3-months");
            }}
          ></GeneralButton>
          <GeneralButton
            style={{
              backgroundColor: `#${
                buttonPressed === "all-time"
                  ? colors.darkChocolate
                  : colors.creme
              }`,
            }}
            label={"All time"}
            handleButtonPress={() => {
              setButtonPressed("all-time");
            }}
          ></GeneralButton>
        </ButtonGroup>
      </ChartContainer>
    </React.Fragment>
  );
};
// border-bottom: ${borders.med}px solid #bca38f;

const ChartContainer = styled.div`
  color: #bca38f;
  font-size: ${text_styles.resizbale_font.lrg};
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  padding: ${paddings.xxsmall}vw;
  border: ${borders.med}px solid #${colors.creme};
  border-radius: ${radiuses.med}px;
  margin-bottom: 2vw;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
  padding: ${paddings.xxsmall}vw;
`;

const Chart = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60%;
`;
//text-decoration: underline;
const TitleInfoBlock = styled.div`
  color: #${colors.creme};
  font-size: ${text_styles.resizbale_font.med};
  font-weight: bold;
  display: flex;
  padding-bottom: ${paddings.xxsmall}vw;

  width: 100%;
  justify-content: center;
  border-bottom: ${borders.med}px solid #bca38f;
  margin-bottom: 2vw;
`;

export default SolvedPuzzlesTypeChartContainer;
