import { Col, Row } from 'react-bootstrap';
import { BigNumber } from 'ethers';
import AuctionActivityWrapper from '../AuctionActivityWrapper';
import AuctionNavigation from '../AuctionNavigation';
import AuctionActivityWordTitle from '../AuctionActivityWordTitle';
import AuctionActivityDateHeadline from '../AuctionActivityDateHeadline';
import AuctionTitleAndNavWrapper from '../AuctionTitleAndNavWrapper';
import { Link } from 'react-router-dom';
import wordContentClasses from './WordderWordContent.module.css';
import auctionBidClasses from '../AuctionActivity/BidHistory.module.css';
import bidBtnClasses from '../BidHistoryBtn//BidHistoryBtn.module.css';
import auctionActivityClasses from '../AuctionActivity/AuctionActivity.module.css';
import CurrentBid, { BID_N_A } from '../CurrentBid';

const WordderWordContent: React.FC<{
  mintTimestamp: BigNumber;
  wordId: BigNumber;
  isFirstAuction: boolean;
  isLastAuction: boolean;
  onPrevAuctionClick: () => void;
  onNextAuctionClick: () => void;
}> = props => {
  const {
    mintTimestamp,
    wordId,
    isFirstAuction,
    isLastAuction,
    onPrevAuctionClick,
    onNextAuctionClick,
  } = props;

  return (
    <AuctionActivityWrapper>
      <div className={auctionActivityClasses.informationRow}>
        <Row className={auctionActivityClasses.activityRow}>
          <Col lg={12}>
            <AuctionActivityDateHeadline startTime={mintTimestamp} />
          </Col>
          <AuctionTitleAndNavWrapper>
            <AuctionActivityWordTitle wordId={wordId} />
            <AuctionNavigation
              isFirstAuction={isFirstAuction}
              isLastAuction={isLastAuction}
              onNextAuctionClick={onNextAuctionClick}
              onPrevAuctionClick={onPrevAuctionClick}
            />
          </AuctionTitleAndNavWrapper>
        </Row>
        <Row className={auctionActivityClasses.activityRow}>
          <Col lg={5} className={auctionActivityClasses.currentBidCol}>
            <CurrentBid currentBid={BID_N_A} auctionEnded={true} />
          </Col>
          <Col
            lg={5}
            className={`${auctionActivityClasses.currentBidCol} ${wordContentClasses.currentBidCol}`}
          >
            <div className={auctionActivityClasses.section}>
              <h4>Winner</h4>
              <h2>wordders.eth</h2>
            </div>
          </Col>
        </Row>
      </div>
      <Row className={auctionActivityClasses.activityRow}>
        <Col lg={12}>
          <ul className={auctionBidClasses.bidCollection}>
            <li className={`${auctionBidClasses.bidRow} ${wordContentClasses.bidRow}`}>
              All Word auction proceeds are sent to the{' '}
              <Link to="/vote" className={wordContentClasses.link}>
                Words DAO
              </Link>
              . For this reason, we, the project's founders (‘Wordders’) have chosen to compensate
              ourselves with Words. Every 10th Word for the first 5 years of the project will be
              sent to our multisig (5/10), where it will be vested and distributed to individual
              Wordders.
            </li>
          </ul>
          <div className={bidBtnClasses.bidHistoryWrapper}>
            <Link to="/wordders" className={bidBtnClasses.bidHistory}>
              Learn More →
            </Link>
          </div>
        </Col>
      </Row>
    </AuctionActivityWrapper>
  );
};
export default WordderWordContent;
