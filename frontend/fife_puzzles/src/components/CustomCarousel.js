import eights_carousel from '../images/eights_carousel.png'
import hashi_carousel from '../images/hashi_carousel.png'
import sudoku_carousel from '../images/sudoku_carousel.png'
import styled from 'styled-components';
import thermo_sudoku_carousel from '../images/thermo_sudoku_carousel.png'
import battle_ships_carousel from '../images/battle_ships_carousel.png'
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import radiuses from "../style-utils/radiuses";
//Customized Image Carousel for home page. This contains images that were screenshoted from power point.
//Base code is taken from:
//Unkown. 2022. React Responsive Carousel.npm. https://www.npmjs.com/package/react-responsive-carousel
//Handle click is defined in parent component (HomeScreen)
export default function CustomCarousel(props) {
    return (
        <Carousel onClickItem={(i) => props.handleClick(i)} autoPlay={true} infiniteLoop={true} interval={3000} showStatus={false} showThumbs={false} width={'35vw'}>
            <div>
                <CarouselImg src={sudoku_carousel} />
            </div>
            <div>
                <CarouselImg src={hashi_carousel} />
            </div>
            <div>
                <CarouselImg src={eights_carousel} />
            </div>
        </Carousel>
    )
}
//Styled img used in carousel.
export const CarouselImg = styled.img`
    width: 30vw;
    height: 20vw;
    border-radius: ${radiuses.xlrg}px;
`