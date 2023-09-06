import sudoku_colors from "../style-utils/sudoku_colors"

export default function DrawPath({width,height,startX,startY,draw,startNode,relationship,isVertical}){
    return(
    <div style={{ backgroundColor:sudoku_colors.focus_section, display: 'flex', position: 'absolute', width: width, height: height, left: startX, top: startY, zIndex: 0 }}>
        <canvas
            onMouseEnter={(e) => {
                // e.target.parentNode.style.backgroundColor = '';
                // removeBackColorFromBridges();
                let canvasCtx = e.target.getContext("2d")
                canvasCtx.strokeStyle = sudoku_colors.same_number
                canvasCtx.lineWidth = 1000
                
            }}
            onMouseMove={(e) => {
                let canvasCtx = e.target.getContext("2d")
                let ratioX=canvasCtx.canvas.width/width;
                let ratioY=canvasCtx.canvas.height/height;
                draw(canvasCtx, e.nativeEvent.layerX*ratioX, e.nativeEvent.layerY*ratioY, canvasCtx.canvas.width, canvasCtx.canvas.height,startNode,relationship,isVertical)

            }}
            onMouseLeave={(e) => {
                let canvasCtx = e.target.getContext("2d")
                canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height)
            }}
            style={{width:width,height:height}} />
    </div>
    )
}