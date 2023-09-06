import { useState } from "react";
import Star from "./Star";

function StarRating({ onChange }) {
    const [rating, setRating] = useState(0);

    const changeRatting = (newRating) => {
        setRating(newRating);
        onChange?.(newRating);
    };

    return(
        <span>
            {[1, 2, 3, 4, 5].map((value => (
                <Star
                key={value}
                filled={value<=rating}
                onClick={()=>changeRatting(value)}
                />
            )))}
        </span>
    )
}

export default StarRating;