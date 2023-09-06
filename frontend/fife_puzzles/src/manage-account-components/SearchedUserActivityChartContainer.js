import { useSelector, useDispatch } from "react-redux";
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

import { Bar, Line } from "react-chartjs-2";
import GeneralButton from "../components/GeneralButton";
import { ScrollView } from "react-native-web";
import { useState } from "react";
import colors from "../style-utils/colors";
import paddings from "../style-utils/paddings";
import margins from "../style-utils/margins";
import borders from "../style-utils/borders";
import radiuses from "../style-utils/radiuses";
import text_styles from "../style-utils/text_styles";
import styled from "styled-components";

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

const SearchedUserActivityChartContainer = (props) => {
  const dispatch = useDispatch();
  const {
    userActivity,
    userActivity6Months,
    userActivityYear,
    lastYearLabels,
    allTimeLabels,
    last6MonthsLabels,
  } = useSelector((state) => state.userToDisplay);

  const [buttonPressed, setButtonPressed] = useState("last-6-months");

  const title = `User Activity - ${
    buttonPressed === "last-6-months"
      ? "Last 6 Months"
      : buttonPressed === "last-year"
      ? "Last Year"
      : "All time"
  }`;

  const labels =
    buttonPressed === "last-6-months"
      ? last6MonthsLabels
      : buttonPressed === "last-year"
      ? lastYearLabels
      : allTimeLabels;

  const dataset =
    buttonPressed === "last-6-months"
      ? userActivity6Months
      : buttonPressed === "last-year"
      ? userActivityYear
      : userActivity;

  const dataBar = {
    labels,
    datasets: [
      {
        label: "#Activity",
        data: dataset,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  const dataLine = {
    labels,
    datasets: [
      {
        label: "#Activity",
        data: dataset,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgb(255, 99, 132)",
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
        ticks: {
          stepSize: 1,
        },
        beginAtZero: true,
        title: {
          display: true,
          text: "#Activity",
        },
      },
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 20,
        },
      },
    },
  };

  return (
    <ChartContainer>
      <TitleInfoBlock>User Activity</TitleInfoBlock>
      <Chart>
        {(buttonPressed === "last-6-months" ||
          buttonPressed === "last-year") && (
          <Bar options={options} data={dataBar} />
        )}
        {buttonPressed === "all-time" && (
          <Line options={options} data={dataLine} />
        )}
      </Chart>
      <ButtonGroup>
        <GeneralButton
          label={"Last 6 Months"}
          style={{
            backgroundColor: `#${
              buttonPressed === "last-6-months"
                ? colors.darkChocolate
                : colors.creme
            }`,
          }}
          handleButtonPress={() => {
            setButtonPressed("last-6-months");
          }}
        ></GeneralButton>
        <GeneralButton
          style={{
            backgroundColor: `#${
              buttonPressed === "last-year"
                ? colors.darkChocolate
                : colors.creme
            }`,
          }}
          label={"Last Year"}
          handleButtonPress={() => {
            setButtonPressed("last-year");
          }}
        ></GeneralButton>
        <GeneralButton
          style={{
            backgroundColor: `#${
              buttonPressed === "all-time" ? colors.darkChocolate : colors.creme
            }`,
          }}
          label={"All Time"}
          handleButtonPress={() => {
            setButtonPressed("all-time");
          }}
        ></GeneralButton>
      </ButtonGroup>
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

export default SearchedUserActivityChartContainer;
