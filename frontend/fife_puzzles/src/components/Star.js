import { FaStar } from "react-icons/fa";

function Star({filled, onClick}) {
    return (
        <FaStar
        color={filled ? "black" : "lightgrey"}
        onClick={onClick} />
    );
}

export default Star;