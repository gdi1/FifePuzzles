import { TouchableOpacity } from "react-native-web";
import styled from 'styled-components';
import colors from "../style-utils/colors";
import paddings from "../style-utils/paddings";
import radiuses from "../style-utils/radiuses";
import text_styles from "../style-utils/text_styles";
import ButtonText from "./ButtonText";
import info_black from "../icons/info_black.png"
import info_chocolate from "../icons/info_chocolate.png"
import { useState } from "react";
import margins from "../style-utils/margins";
export default function InfoButton(props) {
    const [isHover, setIsHover] = useState(false)
    return (
        <InfoButtonStyled onMouseOver={() => { setIsHover(true) }} onMouseLeave={() => { setIsHover(false) }} style={props.style} onClick={props.handleButtonPress}>
            <img src={isHover ? info_chocolate : info_black} style={{ width: '4vw', height: '4vw' }} />
        </InfoButtonStyled>
    );
}
const InfoButtonStyled = styled.div`
    margin-right:${margins.xlrg}px;
    background-color: #${colors.creme};
    display:flex;
    flex-direction: column;
    border-radius: 40px;
    align-items: center;
    justify-content: center;
    align-self: center;
    cursor: pointer;
    &:hover {
        background-color: #${colors.black};
    }
`;