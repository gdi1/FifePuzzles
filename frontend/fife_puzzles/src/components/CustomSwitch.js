import styled from 'styled-components';
import { TouchableOpacity, View } from 'react-native-web';
import margins from '../style-utils/margins';
import text_styles from '../style-utils/text_styles';
import paddings from '../style-utils/paddings';
import radiuses from '../style-utils/radiuses';
//Base code is taken from:
//Addriano Triana. Custom React Switch.sandbox.io.https://codesandbox.io/s/custom-react-switch-zj3in7?from-embed
//This Switch allows multiple options. Must have: optionSize, label, options, active option, handle switch method, and active/inactive colors.
//This Switch has got default styles, but label style and style props, will overwrite them if requested.
//This Component is used in Sudoku Screen
//Props in styled components define, style
export default function CustomSwitch({ style, optionSize, labelStyle, label, options, activeOption, handleSwitch, activeOptionColor, nonActiveOptionColor, activeOptionTextColor, nonActiveOptionTextColor }) {
    return (
        <div style={Object.assign({}, style, { height: "max-content", display: 'flex', flexDirection: 'row', alignItems: 'center' })}>
            <span style={Object.assign({ marginRight: margins.xlrg }, labelStyle)}>{label}</span>
            <SwitchContainer nonActiveOptionColor={nonActiveOptionColor}>
                {options.map((option) => {
                    return (
                        <SwitchOption
                            activeOption={activeOption}
                            option={option}
                            activeOptionColor={activeOptionColor}
                            onClick={() => handleSwitch(option)}>
                            <SwitchOptionText
                                optionSize={optionSize}
                                activeOption={activeOption}
                                option={option}
                                activeOptionTextColor={activeOptionTextColor}
                                nonActiveOptionTextColor={nonActiveOptionTextColor}>{option}</SwitchOptionText>
                        </SwitchOption>
                    );
                })}
            </SwitchContainer>
        </div>
    );
}
//Styled components specific to switch
const SwitchContainer = styled.div`
  display: flex;
  background-color: ${props => props.nonActiveOptionColor};
  align-items: center;
  border-radius: ${radiuses.xxxlrg}px;
  width: max-content;
  height:max-content;
`;
const SwitchOption = styled.div`
  height: 4vh;
  width: 4vw;
  display: flex;
  border-radius: ${radiuses.xxxlrg}px;
  align-items: center;
  justify-content: center;
  padding-top: ${paddings.small}px;
  padding-bottom:${paddings.small}px;
  background-color: ${props => props.activeOption === props.option ? props.activeOptionColor : "transparent"}
`;
const SwitchOptionText = styled.div`
    color: ${props => props.activeOption === props.option ? props.activeOptionTextColor : props.nonActiveOptionTextColor};
    font-size: ${props => props.optionSize};
`;