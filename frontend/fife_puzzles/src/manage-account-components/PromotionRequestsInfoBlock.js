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
import { prActions } from "../store/promotion-requests-slice";
import { useDispatch } from "react-redux";

const PromotionRequestInfoBlock = (props) => {
  const dispatch = useDispatch();
  const [showLoading, setShowLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(true);

  const { promotionRequests, currentLength, totalLength } = useSelector(
    (state) => state.promotionRequests
  );

  const loadingRef = useRef(null);

  const getNewBatch = async (skip) => {
    console.log("Skip is", skip);
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}promotion-requests/active/skip/${skip}`,
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
      const { promRequests, batchSize } = data;
      console.log(promRequests);
      if (promRequests.length !== 0) {
        dispatch(prActions.addEarlierPromotionRequests(promRequests));
        setIsFetching(false);
        if (promRequests.length < batchSize) {
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
      <TitleInfoBlock>Promotion Requests</TitleInfoBlock>
      <ScrollView
        style={{
          display: "flex",
          flexDirection: "column",
          height: 100,
        }}
      >
        {promotionRequests.map((request) => (
          <RequestInfoBlock
            requestInfo={request}
            key={request._id}
          ></RequestInfoBlock>
        ))}
        {!showLoading && totalLength === 0 && (
          <TitleInfoBlock
            style={{
              fontSize: `${text_styles.resizbale_font.med}`,
              borderBottom: "none",
              marginTop: `${margins.xsmall}vw`,
            }}
          >
            No new promotion requests.
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

export default PromotionRequestInfoBlock;
