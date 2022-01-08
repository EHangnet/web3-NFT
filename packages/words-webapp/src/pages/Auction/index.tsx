import { BigNumber } from 'ethers';
import Banner from '../../components/Banner';
import Auction from '../../components/Auction';
import Documentation from '../../components/Documentation';
import HistoryCollection from '../../components/HistoryCollection';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setOnDisplayAuctionWordId } from '../../state/slices/onDisplayAuction';
import { push } from 'connected-react-router';
import { wordPath } from '../../utils/history';
import useOnDisplayAuction from '../../wrappers/onDisplayAuction';
import { useEffect } from 'react';

interface AuctionPageProps {
  initialAuctionId?: number;
}

const AuctionPage: React.FC<AuctionPageProps> = props => {
  const { initialAuctionId } = props;
  const onDisplayAuction = useOnDisplayAuction();
  const lastAuctionWordId = useAppSelector(state => state.onDisplayAuction.lastAuctionWordId);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!lastAuctionWordId) return;

    if (initialAuctionId !== undefined) {
      // handle out of bounds word path ids
      if (initialAuctionId > lastAuctionWordId || initialAuctionId < 0) {
        dispatch(setOnDisplayAuctionWordId(lastAuctionWordId));
        dispatch(push(wordPath(lastAuctionWordId)));
      } else {
        if (onDisplayAuction === undefined) {
          // handle regular word path ids on first load
          dispatch(setOnDisplayAuctionWordId(initialAuctionId));
        }
      }
    } else {
      // no word path id set
      if (lastAuctionWordId) {
        dispatch(setOnDisplayAuctionWordId(lastAuctionWordId));
      }
    }
  }, [lastAuctionWordId, dispatch, initialAuctionId, onDisplayAuction]);

  return (
    <>
      <Auction auction={onDisplayAuction} />
      <Banner />
      {lastAuctionWordId && (
        <HistoryCollection latestWordId={BigNumber.from(lastAuctionWordId)} historyCount={10} />
      )}
      <Documentation />
    </>
  );
};
export default AuctionPage;
