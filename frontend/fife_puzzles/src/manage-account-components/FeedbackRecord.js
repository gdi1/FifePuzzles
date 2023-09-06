import margins from "../style-utils/margins";
import radiuses from "../style-utils/radiuses";
import borders from '../style-utils/borders'
import colors from "../style-utils/colors";
import GeneralButton from "../components/GeneralButton";
import paddings from "../style-utils/paddings";
import styled from "styled-components";
import React, { useCallback, useRef, useState, useEffect } from "react";
import text_styles from "../style-utils/text_styles";
import CircularProgress from '@mui/material/CircularProgress';
import FlagCommentButton from "../components/FlagCommentButton";


export default function FeedbackRecord({ showDelete, id, comment, handleButtonPress, loadingDeleteFeedbackStarted, isCurrentDeleted, handleFlag }) {
    return (
        <CardContainer>
            <InfoPart>
                <span style={{ fontSize: text_styles.resizbale_font.small_med, color: text_styles.colors.primary }}>User ID: {id}</span>
                <br />
                <span style={{ fontSize: text_styles.resizbale_font.small_med, color: text_styles.colors.primary }}>Comment: {comment}</span>
            </InfoPart>
            <Buttons>
                {showDelete && (
                    loadingDeleteFeedbackStarted && isCurrentDeleted
                        ?
                        <>
                            <CircularProgress style={{ width: 50, height: 50, color: `#${colors.creme}` }} color={"inherit"} />
                            <div style={{ height: '1vh' }} />
                        </>
                        :
                        <>
                            <GeneralButton label={"Delete"} handleButtonPress={handleButtonPress} />
                            <div style={{ height: '1vh' }} />
                        </>
                )
                }
                <FlagCommentButton handleFlag={handleFlag} />
            </Buttons>
        </CardContainer>
    );
}

const CardContainer = styled.div`
    width: flex;
    height: content;
    border-radius: ${radiuses.med}px;
    padding: ${paddings.med}px;
    display: flex;
    margin: ${margins.xlrg}px;
    border:${borders.lrg}px solid #${colors.chocolate};
`
const InfoPart = styled.div`
    flex: 3;
    flex-direction:column;
    justify-content:space-evenly;
    display:flex ;
`
export const Buttons = styled.div`
    flex: 1; 
    display:flex;
    justify-content:center;
    align-items:center;
    flex-direction:column
`