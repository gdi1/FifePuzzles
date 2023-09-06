import React, { Component, useState } from "react";
import { render } from "react-dom";
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";

const displayPlane = () => {

}
comments[currentComments, setCurrentComments] = useState([]);


return(
    <div>
        <SlidingPane>
            <div className="listOfComments">
                {currentComments.map((comment, key) => {
                    return (
                        <div key={key} className= "comment">
                            {comment.comment-body}
                        </div>
                    );
                })}
            </div>
        </SlidingPane>
    </div>
);