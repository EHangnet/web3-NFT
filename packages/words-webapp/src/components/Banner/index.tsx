import classes from './Banner.module.css';
import Section from '../../layout/Section';
import { Col } from 'react-bootstrap';
import calendar_word from '../../assets/calendar_word.png';
import Word from '../Word';

const Banner = () => {
  return (
    <Section fullWidth={false} className={classes.bannerSection}>
      <Col lg={6}>
        <div className={classes.wrapper}>
          <h1>
            ONE NOUN,
            <br />
            EVERY DAY,
            <br />
            FOREVER.
          </h1>
        </div>
      </Col>
      <Col lg={6}>
        <div style={{ padding: '2rem' }}>
          <Word imgPath={calendar_word} alt="word" />
        </div>
      </Col>
    </Section>
  );
};

export default Banner;
