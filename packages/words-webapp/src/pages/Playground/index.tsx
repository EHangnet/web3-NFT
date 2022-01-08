import { Container, Col, Button, Row, FloatingLabel, Form } from 'react-bootstrap';
import classes from './Playground.module.css';
import React, { useEffect, useState } from 'react';
import Link from '../../components/Link';
import { ImageData, getWordData, getRandomWordSeed } from '@words/assets';
import { buildSVG } from '@words/sdk';
import Word from '../../components/Word';
import WordModal from './WordModal';

interface Trait {
  title: string;
  traitNames: string[];
}

const wordsProtocolLink = (
  <Link
    text="Words Protocol"
    url="https://www.notion.so/Word-Protocol-32e4f0bf74fe433e927e2ea35e52a507"
    leavesPage={true}
  />
);

const wordsAssetsLink = (
  <Link
    text="words-assets"
    url="https://github.com/wordsDAO/words-monorepo/tree/master/packages/words-assets"
    leavesPage={true}
  />
);

const wordsSDKLink = (
  <Link
    text="words-sdk"
    url="https://github.com/wordsDAO/words-monorepo/tree/master/packages/words-sdk"
    leavesPage={true}
  />
);

const parseTraitName = (partName: string): string =>
  capitalizeFirstLetter(partName.substring(partName.indexOf('-') + 1));

const capitalizeFirstLetter = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

const Playground: React.FC = () => {
  const [wordSvgs, setWordSvgs] = useState<string[]>();
  const [traits, setTraits] = useState<Trait[]>();
  const [modSeed, setModSeed] = useState<{ [key: string]: number }>();
  const [initLoad, setInitLoad] = useState<boolean>(true);
  const [displayWord, setDisplayWord] = useState<boolean>(false);
  const [indexOfWordToDisplay, setIndexOfWordToDisplay] = useState<number>();

  const generateWordSvg = React.useCallback(
    (amount: number = 1) => {
      for (let i = 0; i < amount; i++) {
        const seed = { ...getRandomWordSeed(), ...modSeed };
        const { parts, background } = getWordData(seed);
        const svg = buildSVG(parts, ImageData.palette, background);
        setWordSvgs(prev => {
          return prev ? [svg, ...prev] : [svg];
        });
      }
    },
    [modSeed],
  );

  useEffect(() => {
    const traitTitles = ['background', 'body', 'accessory', 'head', 'glasses'];
    const traitNames = [
      ['cool', 'warm'],
      ...Object.values(ImageData.images).map(i => {
        return i.map(imageData => imageData.filename);
      }),
    ];
    setTraits(
      traitTitles.map((value, index) => {
        return {
          title: value,
          traitNames: traitNames[index],
        };
      }),
    );

    if (initLoad) {
      generateWordSvg(8);
      setInitLoad(false);
    }
  }, [generateWordSvg, initLoad]);

  const traitOptions = (trait: Trait) => {
    return Array.from(Array(trait.traitNames.length + 1)).map((_, index) => {
      const parsedTitle = index === 0 ? `Random` : parseTraitName(trait.traitNames[index - 1]);
      return <option key={index}>{parsedTitle}</option>;
    });
  };

  const traitButtonHandler = (trait: Trait, traitIndex: number) => {
    setModSeed(prev => {
      // -1 traitIndex = random
      if (traitIndex < 0) {
        let state = { ...prev };
        delete state[trait.title];
        return state;
      }
      return {
        ...prev,
        [trait.title]: traitIndex,
      };
    });
  };

  return (
    <>
      {displayWord && indexOfWordToDisplay !== undefined && wordSvgs && (
        <WordModal
          onDismiss={() => {
            setDisplayWord(false);
          }}
          svg={wordSvgs[indexOfWordToDisplay]}
        />
      )}

      <Container fluid="lg">
        <Row>
          <Col lg={10} className={classes.headerRow}>
            <span>Explore</span>
            <h1>Playground</h1>
            <p>
              The playground was built using the {wordsProtocolLink}. Word's traits are determined
              by the Word Seed. The seed was generated using {wordsAssetsLink} and rendered using
              the {wordsSDKLink}.
            </p>
          </Col>
        </Row>
        <Row>
          <Col lg={3}>
            <Button
              onClick={() => {
                generateWordSvg();
              }}
              className={classes.generateBtn}
            >
              Generate Words
            </Button>
            {traits &&
              traits.map((trait, index) => {
                return (
                  <Form className={classes.traitForm}>
                    <FloatingLabel
                      controlId="floatingSelect"
                      label={capitalizeFirstLetter(trait.title)}
                      key={index}
                      className={classes.floatingLabel}
                    >
                      <Form.Select
                        aria-label="Floating label select example"
                        className={classes.traitFormBtn}
                        onChange={e => {
                          let index = e.currentTarget.selectedIndex;
                          traitButtonHandler(trait, index - 1); // - 1 to account for 'random'
                        }}
                      >
                        {traitOptions(trait)}
                      </Form.Select>
                    </FloatingLabel>
                  </Form>
                );
              })}
            <p className={classes.wordYearsFooter}>
              You've generated {wordSvgs ? (wordSvgs.length / 365).toFixed(2) : '0'} years worth of
              Words
            </p>
          </Col>
          <Col lg={9}>
            <Row>
              {wordSvgs &&
                wordSvgs.map((svg, i) => {
                  return (
                    <Col xs={4} lg={3} key={i}>
                      <div
                        onClick={() => {
                          setIndexOfWordToDisplay(i);
                          setDisplayWord(true);
                        }}
                      >
                        <Word
                          imgPath={`data:image/svg+xml;base64,${btoa(svg)}`}
                          alt="word"
                          className={classes.wordImg}
                          wrapperClassName={classes.wordWrapper}
                        />
                      </div>
                    </Col>
                  );
                })}
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
};
export default Playground;
