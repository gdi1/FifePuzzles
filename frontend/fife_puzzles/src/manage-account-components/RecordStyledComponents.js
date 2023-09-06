import margins from "../style-utils/margins";
import radiuses from "../style-utils/radiuses";
import borders from '../style-utils/borders'
import colors from "../style-utils/colors";
import paddings from "../style-utils/paddings";
import styled from "styled-components";
import text_styles from "../style-utils/text_styles";

export const CardContainer = styled.div`
    width: flex;
    height: content;
    border-radius: ${radiuses.med}px;
    padding: ${paddings.small}px;
    display: flex;
    margin: ${margins.med}px;
    border:${borders.lrg}px solid #${colors.chocolate};
`
export const InfoPart = styled.div`
    flex: 3;
    flex-direction:column;
    justify-content:space-evenly;
    display:flex ;
`
export const PuzzlePart = styled.div`
    flex: 4;
    display:flex;
    justify-content:space-evenly;
    transition: all ease-in-out 0.9s;
    &:hover {
        transform: translate(-25%,0px) scale(1.78);
        padding-top:${paddings.xsmall}vh;
        padding-bottom:${paddings.xsmall}vh;
        margin-top:${margins.med}vh;
        margin-bottom:${margins.med}vh;
        align-content:center;
        background: linear-gradient(rgba(100, 100, 100, 0.8), rgba(10, 10, 10, 0.8));
        transition: all ease-in-out 0.9s;
    }
`
export const PuzzlePartv2 = styled.div`
    flex: 4;
    display:flex;
    justify-content:space-evenly;
    transition: all ease-in-out 0.9s;
`
export const Buttons = styled.div`
    flex: 1; 
    display:flex;
    justify-content:center;
    align-items:center;
    flex-direction:column
`