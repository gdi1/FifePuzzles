import text_styles from "../style-utils/text_styles";
import colors from "../style-utils/colors";
import radiuses from "../style-utils/radiuses";
import margins from "../style-utils/margins";
import paddings from "../style-utils/paddings";
import styled from 'styled-components';
//Styled component for button text
const ButtonText = styled.span`
    color: #${text_styles.colors.black};
    font-size: ${text_styles.resizbale_font.small_med};
    font-weight: bold
`;
export default ButtonText;