import styled from 'styled-components';
import { TouchableOpacity, View } from 'react-native-web';
import margins from '../style-utils/margins';
import text_styles from '../style-utils/text_styles';
import paddings from '../style-utils/paddings';
import radiuses from '../style-utils/radiuses';
import { optionSize, switch_container, switch_label } from "../inline-styles/switch"
export default function RatingsLabel({ rating }) {
    return (
        <div style={Object.assign({}, switch_container, { height: "max-content", display: 'flex', flexDirection: 'row', alignItems: 'center' })}>
            <span style={Object.assign({ margin: margins.xlrg }, switch_label)}>Average Rating: {rating == null ? "N/A" : rating.toFixed(1)}</span>
        </div>
    );
}
