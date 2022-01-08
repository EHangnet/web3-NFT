import { BigNumber } from 'ethers';
import classes from './AuctionActivityWordTitle.module.css';

const AuctionActivityWordTitle: React.FC<{ wordId: BigNumber }> = props => {
  const { wordId } = props;
  const wordIdContent = `Word ${wordId.toString()}`;
  return (
    <div className={classes.wrapper}>
      <h1>{wordIdContent}</h1>
    </div>
  );
};
export default AuctionActivityWordTitle;
