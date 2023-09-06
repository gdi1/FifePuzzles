import CircularProgress from '@mui/material/CircularProgress';
import colors from '../style-utils/colors';
//Customized circular progress that is place in center of a container. It fills entire space of flex conatiner
export default function CustomProgress() {
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress style={{ width: 100, height: 100, color: `#${colors.creme}` }} color={"inherit"} />
        </div>
    );
}