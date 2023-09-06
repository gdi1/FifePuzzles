import Navigation from "../components/NavigationBar";
import Modal from 'react-modal';
import { useEffect, useRef } from 'react';
import puzzles_pattern from '../images/puzzles_pattern.png'
import MainPageContainer, { HomeContentConatiner } from '../components/MainPageContainer'
import { RulesTextConatiner, TextConatiner, TextConatinerP } from "../components/TextContainer";
import home_intro from '../FixedMessages/home_intro.txt'
import sudoku_rules from '../FixedMessages/sudoku_rules.txt'
import thermo_sudoku_rules from '../FixedMessages/thermo_sudoku_rules.txt'
import hashi_rules from '../FixedMessages/hashi_rules.txt'
import eights_puzzle_rules from '../FixedMessages/eights_puzzle_rules.txt'
import battle_ships_rules from '../FixedMessages/battle_ships_rules.txt'
import { useState } from 'react';
import Spacer from "../components/Spacer";
import CustomCarousel from "../components/CustomCarousel";
import { modal_content, modal_label } from "../inline-styles/modal";
import { useSelector } from "react-redux";
import { Link, DirectLink, Element, Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'

// Home page which is the default page the user is returned to and starts from
function Home() {

  // Get the currently logged in user
  const { user } = useSelector((state) => state.login);
  useEffect(() => {
    (async () => {
      fetch(home_intro).then(text => text.text()).then(text => set_intro_text(text))
    })();
    if (RulesContainerRef.current != null) {
      console.log(RulesContainerRef.current)
      RulesContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    console.log(user)
  }, [])
  const [intro_text, set_intro_text] = useState("");
  const [rules_text, set_rules_text] = useState("");
  const rulesModalRef = useRef(null);
  const [rulesModalIsOpen, setRulesModalIsOpen] = useState(false);
  function handleClick(item) {
    let rules = [sudoku_rules, hashi_rules, eights_puzzle_rules];
    (async () => {
      fetch(rules[item]).then(text => text.text()).then(text => {
        set_rules_text(text);
        setRulesModalIsOpen(true);
      })
    })();
  }
  const RulesContainerRef = useRef(null);
  return (
    <>
      <MainPageContainer image_back={puzzles_pattern}>
        <Navigation />
        <Modal
          ref={rulesModalRef}
          isOpen={rulesModalIsOpen}
          ariaHideApp={false}
          onRequestClose={() => setRulesModalIsOpen(false)}
          style={modal_content}
        >
          <RulesTextConatiner ref={RulesContainerRef}>
            {rules_text.split('\n').map(para => {
              return (
                <>
                  <TextConatinerP>
                    {para}
                  </TextConatinerP>
                </>
              )
            })}
          </RulesTextConatiner>
        </Modal>
        <Spacer />
        <HomeContentConatiner>
          <Spacer />
          <CustomCarousel handleClick={handleClick} />
          <Spacer />
          <TextConatiner>
            {intro_text.split('\n').map(para => {
              return (
                <>
                  <TextConatinerP>
                    {para}
                  </TextConatinerP>
                </>
              )
            })}
          </TextConatiner>
          <Spacer />
        </HomeContentConatiner>
        <Spacer />
      </MainPageContainer >
    </>
  );
}

export default Home;