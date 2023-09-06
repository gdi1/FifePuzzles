import { GeneralModalButtonStyle, modal_content, modal_label, multibutton_container } from '../inline-styles/modal'
import Modal from 'react-modal';
import { useRef } from "react";
import MainPageContainer from "../components/MainPageContainer";
import puzzles_pattern from '../images/puzzles_pattern.png'
import GeneralButton from "../components/GeneralButton";

// Used to ask the user for confirmation if they unexpectedly reach the login page
const PopUp = (props) => {
  const { name, onAccept, onCancel, token } = props;
  const popUpModalRef=useRef()
  return (
    <MainPageContainer image_back={puzzles_pattern}>
    <Modal
        ariaHideApp={false}
        ref={popUpModalRef}
        isOpen={true}
        onRequestClose={() => { }}
        style={modal_content}
      >
        {/*Ask the user if they want to try register themselves on a different website*/}
        <span style={modal_label}>Cross-site register as {name}?</span>
        <div style={multibutton_container}>
        {/*Buttons to allow the user to cancel trying to login or continue trying to login*/}
        <GeneralButton style={GeneralModalButtonStyle} label={"Cancel"} handleButtonPress={onCancel}/>
        <GeneralButton style={GeneralModalButtonStyle} label={"Yes"} handleButtonPress={() => onAccept(token)}/>
        </div>
      </Modal>
      </MainPageContainer>
  );
};

export default PopUp;
