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
import { fcActions } from "../store/flagged-comments-slice";
import { useDispatch } from "react-redux";
import FlaggedCommentInfoBlock from "./FlaggedCommentInfoBlock";

const FlaggedCommentsInfo = (props) => {
  const dispatch = useDispatch();
  const [showLoading, setShowLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(true);

  const { flaggedComments, currentLength, totalLength } = useSelector(
    (state) => state.flaggedComments
  );

  const loadingRef = useRef(null);

  const getNewBatch = async (skip) => {
    console.log("Skip is", skip);
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}flagged-comments/active/skip/${skip}`,
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
      const { flaggedComments, batchSize } = data;
      console.log(flaggedComments);
      if (flaggedComments.length !== 0) {
        dispatch(fcActions.addEarlierFlaggedComments(flaggedComments));
        setIsFetching(false);
        if (flaggedComments.length < batchSize) {
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
      <TitleInfoBlock>Flagged Comments</TitleInfoBlock>
      <ScrollView
        style={{
          display: "flex",
          flexDirection: "column",
          height: 100,
        }}
      >
        {flaggedComments.map((flaggedComment) => (
          <FlaggedCommentInfoBlock
            flaggedCommentInfo={flaggedComment}
            key={flaggedComment._id}
          ></FlaggedCommentInfoBlock>
        ))}
        {!showLoading && totalLength === 0 && (
          <TitleInfoBlock
            style={{
              fontSize: `${text_styles.resizbale_font.med}`,
              borderBottom: "none",
              marginTop: `${margins.xsmall}vw`,
            }}
          >
            No new flagged comments.
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

export default FlaggedCommentsInfo;
