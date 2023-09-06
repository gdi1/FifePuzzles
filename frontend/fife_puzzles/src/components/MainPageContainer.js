import styled from 'styled-components';
//Main page container that displays everything in a flex box and occupies entire screen.
//Must have a background image.
//Without this container, all components wouldn't be place appropriatelly. because all components' positions are definied assuming they are in flex box.
export default function MainPageContainer(props) {
  return (
    <Container image_back={props.image_back}>
      {props.children}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-image: linear-gradient(rgba(0, 0, 0, 0.681), rgba(0, 0, 0, 0.68)),url(${props => props.image_back});
  background-size: cover;
  background-position: center;
`;

export const HomeContentConatiner = styled.div`
  display: flex;
  align-items:center;
  flex-direction: row   
`;
