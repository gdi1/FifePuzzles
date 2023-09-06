import { Link, Outlet, Route, Router, Routes, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import GeneralButton from "../components/GeneralButton";
import Navigation from "../components/NavigationBar";
import SudokuScreen from "./SudokuScreen";
import CustomProgress from "../components/CustomProgress";
import { useFilePicker } from 'use-file-picker';
import Modal from 'react-modal';
import { GeneralModalButtonStyle, modal_content, modal_label } from '../inline-styles/modal'
import MainPageContainer from '../components/MainPageContainer'
import margins from "../style-utils/margins";
import colors from "../style-utils/colors";
import hahsi_image from "../images/hashi_image.jpg"

export default function CreateHashiMenuScreen() {

    const navigate = useNavigate();

    let button_style = { width: '15vw', marginTop: margins.lrg };
    return (
        <>
            <MainPageContainer image_back={hahsi_image}>
                <Navigation />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'space-evenly' }}>
                    <div style={{ alignSelf: 'center', textDecoration: 'none', color: 'black' }}>{/*Getting easy puzzle */}
                        <GeneralButton style={button_style}
                            handleButtonPress={async () => {
                                navigate('/create_hashi_menu/create_hashi', { state: { width: 7, height: 10 } });
                            }} label={"7x10 grid"} />
                    </div>
                    <div style={{ alignSelf: 'center', textDecoration: 'none', color: 'black' }}>{/*Getting medium puzzle */}
                        <GeneralButton
                            style={button_style}
                            handleButtonPress={async () => {
                                navigate('/create_hashi_menu/create_hashi', { state: { width: 8, height: 11 } });
                            }} label={"8x11 grid"} />
                    </div>
                    <div style={{ alignSelf: 'center', textDecoration: 'none', color: 'black' }}>{/*Getting hard puzzle */}
                        <GeneralButton
                            style={button_style}
                            handleButtonPress={async () => {
                                navigate('/create_hashi_menu/create_hashi', { state: { width: 9, height: 13 } });
                            }} label={"9x13 grid"} />
                    </div>
                </div>

            </MainPageContainer>
        </>
    );
}