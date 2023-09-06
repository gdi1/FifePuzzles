import colors from "../style-utils/colors";
import margins from "../style-utils/margins";
import radiuses from "../style-utils/radiuses";
import text_styles from "../style-utils/text_styles";

export const switch_container = {
    margin: 60,
    background: 'linear-gradient(rgba(0, 0, 0, 0.681), rgba(0, 0, 0, 0.68))',
    borderRadius: radiuses.xxxlrg
}

export const switch_label = {
    color: `#${colors.chocolate}`,
    fontWeight: 'bold',
    fontSize: text_styles.resizbale_font.small_med,
    marginLeft: margins.xlrg
}

export const optionSize = text_styles.resizbale_font.small_med;