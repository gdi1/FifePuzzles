import { useSelector } from "react-redux";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";

import { Bar } from "react-chartjs-2";
import colors from "../style-utils/colors";
import paddings from "../style-utils/paddings";
import borders from "../style-utils/borders";
import radiuses from "../style-utils/radiuses";
import text_styles from "../style-utils/text_styles";
import styled from "styled-components";
import GeneralButton from "../components/GeneralButton";
import { useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SearchedUserPuzzleTypeChartContainer = (props) => {
  const {
    solvedPuzzlesType,
    solvedPuzzleTypeLabels,
    solvedPuzzleDifficultyLabels,
    solvedPuzzlesDifficulty,
  } = useSelector((state) => state.userToDisplay);

  const dataBar1 = {
    labels: solvedPuzzleTypeLabels,
    datasets: [
      {
        label: "#Puzzles",
        data: solvedPuzzlesType,
        backgroundColor: [
          "rgb(75, 192, 192, 0.5)",
          "rgba(53, 162, 235, 0.5)",
          "rgba(255, 99, 132, 0.5)",
        ],
      },
    ],
  };

  const dataBar2 = {
    labels: solvedPuzzleDifficultyLabels,
    datasets: [
      {
        label: "#Puzzles",
        data: solvedPuzzlesDifficulty,
        backgroundColor: [
          "rgb(75, 192, 192, 0.5)",
          "rgba(53, 162, 235, 0.5)",
          "rgba(255, 99, 132, 0.5)",
        ],
      },
    ],
  };

  const optionsType = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Solved Puzzles by Type",
      },
    },
    scales: {
      y: {
        ticks: {
          stepSize: 1,
        },
        beginAtZero: true,
        title: {
          display: true,
          text: "#Puzzles",
        },
      },
    },
  };

  const optionsDifficulty = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Solved Puzzles by Difficulty",
      },
    },
    scales: {
      y: {
        ticks: {
          stepSize: 1,
        },
        beginAtZero: true,
        title: {
          display: true,
          text: "#Puzzles",
        },
      },
    },
  };

  return (
    <ChartContainer>
      <TitleInfoBlock>Solved Puzzles Activity</TitleInfoBlock>
      <Chart>
        <Bar options={optionsType} data={dataBar1} />
        <Bar options={optionsDifficulty} data={dataBar2} />
      </Chart>
    </ChartContainer>
  );
};

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

const Chart = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: 40%;
  gap: 4vw;
`;

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

export default SearchedUserPuzzleTypeChartContainer;
