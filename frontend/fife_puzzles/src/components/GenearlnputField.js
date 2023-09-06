import CircularProgress from '@mui/material/CircularProgress';
import colors from '../style-utils/colors';
import styled from 'styled-components';
import radiuses from "../style-utils/radiuses";
import borders from "../style-utils/borders";
import text_styles from "../style-utils/text_styles";
//Customized circular progress that is place in center of a container. It fills entire space of flex conatiner
export default function GeneralInputField({inputRef}) {
    return (
        <MessageFieldInput ref={inputRef}/>
    );
}

export const MessageFieldInput = styled.textarea`
  border-radius: ${radiuses.small}px;
  border: ${borders.med}px solid antiquewhite;

  font-size: ${text_styles.resizbale_font.small};
  outline: ${(props) => (props.isInvalid ? "auto" : "none")};
  outline-color: ${(props) => props.isInvalid && `#${colors.error}`};
`;