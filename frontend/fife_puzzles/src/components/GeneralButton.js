import { TouchableOpacity } from "react-native-web";
import styled from 'styled-components';
import colors from "../style-utils/colors";
import paddings from "../style-utils/paddings";
import radiuses from "../style-utils/radiuses";
import text_styles from "../style-utils/text_styles";
import ButtonText from "./ButtonText";
//General button that fulfills our main style, however, can by overwritten by style prop. This button also allows custom functions.
//A completely abstract button.
export default function GeneralButton(props) {
    return (
        <ButtonStyled style={props.style} onClick={props.handleButtonPress}>
            {props.label && <ButtonText>{props.label}</ButtonText>}
            {props.children}
        </ButtonStyled>
    );
}
const ButtonStyled = styled.div`
    background-color: #${colors.creme};
    display:flex;
    flex-direction: column;
    border-radius: ${radiuses.lrg}px;
    padding: ${paddings.lrg}px;
    width: max-content;
    align-items: center;
    justify-content: center;
    align-self: center;
    cursor: pointer;
    &:hover {
        background-color: #${colors.chocolate};
    }
`;