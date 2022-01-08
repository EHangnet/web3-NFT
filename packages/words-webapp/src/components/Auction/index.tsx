import { Col } from 'react-bootstrap';
import { StandaloneWordWithSeed } from '../StandaloneWord';
import AuctionActivity from '../AuctionActivity';
import { Row, Container } from 'react-bootstrap';
import { setStateBackgroundColor } from '../../state/slices/application';
import { LoadingWord } from '../Word';
import { Auction as IAuction } from '../../wrappers/wordsAuction';
import classes from './Auction.module.css';
import { IWordSeed } from '../../wrappers/wordToken';
import WordderWordContent from '../WordderWordContent';
import { useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { isWordderWord } from '../../utils/wordderWord';
import {
  setNextOnDisplayAuctionWordId,
  setPrevOnDisplayAuctionWordId,
} from '../../state/slices/onDisplayAuction';
import { beige, grey } from '../../utils/wordBgColors';

interface AuctionProps {
  auction?: IAuction;
}

const Auction: React.FC<AuctionProps> = props => {
  const { auction: currentAuction } = props;

  const history = useHistory();
  const dispatch = useAppDispatch();
  let stateBgColor = useAppSelector(state => state.application.stateBackgroundColor);
  const lastWordId = useAppSelector(state => state.onDisplayAuction.lastAuctionWordId);

  const loadedWordHandler = (seed: IWordSeed) => {
    dispatch(setStateBackgroundColor(seed.background === 0 ? grey : beige));
  };

  const prevAuctionHandler = () => {
    dispatch(setPrevOnDisplayAuctionWordId());
    currentAuction && history.push(`/auction/${currentAuction.wordId.toNumber() - 1}`);
  };
  const nextAuctionHandler = () => {
    dispatch(setNextOnDisplayAuctionWordId());
    currentAuction && history.push(`/auction/${currentAuction.wordId.toNumber() + 1}`);
  };

  const wordContent = currentAuction && (
    <div className={classes.wordWrapper}>
      <StandaloneWordWithSeed
        wordId={currentAuction.wordId}
        onLoadSeed={loadedWordHandler}
        shouldLinkToProfile={false}
      />
    </div>
  );

  const loadingWord = (
    <div className={classes.wordWrapper}>
      <LoadingWord />
    </div>
  );

  const currentAuctionActivityContent = currentAuction && lastWordId && (
    <AuctionActivity
      auction={currentAuction}
      isFirstAuction={currentAuction.wordId.eq(0)}
      isLastAuction={currentAuction.wordId.eq(lastWordId)}
      onPrevAuctionClick={prevAuctionHandler}
      onNextAuctionClick={nextAuctionHandler}
      displayGraphDepComps={true}
    />
  );
  const wordderWordContent = currentAuction && lastWordId && (
    <WordderWordContent
      mintTimestamp={currentAuction.startTime}
      wordId={currentAuction.wordId}
      isFirstAuction={currentAuction.wordId.eq(0)}
      isLastAuction={currentAuction.wordId.eq(lastWordId)}
      onPrevAuctionClick={prevAuctionHandler}
      onNextAuctionClick={nextAuctionHandler}
    />
  );

  return (
    <div style={{ backgroundColor: stateBgColor }}>
      <Container fluid="lg">
        <Row>
          <Col lg={{ span: 6 }} className={classes.wordContentCol}>
            {currentAuction ? wordContent : loadingWord}
          </Col>
          <Col lg={{ span: 6 }} className={classes.auctionActivityCol}>
            {currentAuction &&
              (isWordderWord(currentAuction.wordId)
                ? wordderWordContent
                : currentAuctionActivityContent)}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Auction;
