import styled from 'styled-components';
import colors from '../style-utils/colors';
import radiuses from '../style-utils/radiuses';
import paddings from '../style-utils/paddings';
import text_styles from '../style-utils/text_styles';
//Styled components for text or info containers. Used to outline messages or important information


export const TextConatiner = styled.div`
    background: linear-gradient(rgba(0, 0, 0, 0.681), rgba(0, 0, 0, 0.68));
    display:flex;
    align-items:center;
    justify-content:center;
    flex-direction:column;
    padding:${paddings.med}px;
    width:max-content;
    color:#${colors.creme};
    border-radius: ${radiuses.med}px;
    font-weight:bold;
    width:30%;
    font-size:${text_styles.resizbale_font.med}
`
export const TextConatinerP = styled.p`
    display:flex;
    text-align:center;
    align-self:center;
    color:#${colors.creme};
    font-size:${text_styles.resizbale_font.med}
`
export const RulesTextConatiner = styled.div`
    width: 40vw; 
    height: 60vh;
    display: flex;
    flex-direction: column
`