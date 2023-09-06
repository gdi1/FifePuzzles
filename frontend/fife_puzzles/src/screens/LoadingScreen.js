import CustomProgress from "../components/CustomProgress";
import MainPageContainer from "../components/MainPageContainer";
import puzzles_pattern from '../images/puzzles_pattern.png'

// Used when waiting for a response from the server, useful for if the server isn't responding quickly
export default function LoadingScreen() {
    return (
        <MainPageContainer image_back={puzzles_pattern}>
            <CustomProgress />
        </MainPageContainer>
    )
}