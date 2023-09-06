import colors from "../style-utils/colors";
import borders from "../style-utils/borders";
import text_styles from "../style-utils/text_styles";
import margins from "../style-utils/margins";

export const modal_label = {
    alignSelf: 'center',
    color: text_styles.colors.primary,
    fontSize: text_styles.resizbale_font.small_med,
    fontWeight: 'bold'
}

export const multibutton_container={
    display:'flex',
    flexDirection:'row', 
    justifyContent:'space-evenly'
}
export const modal_content = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: `#${colors.modal}`,
        border: `${borders.med}px solid #${colors.modal_border}`
    },
    overlay: {
        background: 'linear-gradient(rgba(0, 0, 0, 0.681), rgba(0, 0, 0, 0.68))',
        zIndex: 10,
    }
}

export const GeneralModalButtonStyle = { marginTop: margins.lrg, width: '5vw', height: '3vh' , minWidth:'max-content'};