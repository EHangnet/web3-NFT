import { BigNumber, BigNumberish } from 'ethers';
import Section from '../../layout/Section';
import classes from './HistoryCollection.module.css';
import clsx from 'clsx';
import StandaloneWord from '../StandaloneWord';
import { LoadingWord } from '../Word';
import config from '../../config';
import { Container, Row } from 'react-bootstrap';

interface HistoryCollectionProps {
  historyCount: number;
  latestWordId: BigNumberish;
}

const HistoryCollection: React.FC<HistoryCollectionProps> = (props: HistoryCollectionProps) => {
  const { historyCount, latestWordId } = props;

  if (!latestWordId) return null;

  const startAtZero = BigNumber.from(latestWordId).sub(historyCount).lt(0);

  let wordIds: Array<BigNumber | null> = new Array(historyCount);
  wordIds = wordIds.fill(null).map((_, i) => {
    if (BigNumber.from(i).lt(latestWordId)) {
      const index = startAtZero
        ? BigNumber.from(0)
        : BigNumber.from(Number(latestWordId) - historyCount);
      return index.add(i);
    } else {
      return null;
    }
  });

  const wordsContent = wordIds.map((wordId, i) => {
    return !wordId ? <LoadingWord key={i} /> : <StandaloneWord key={i} wordId={wordId} />;
  });

  return (
    <Section fullWidth={true}>
      <Container fluid>
        <Row className="justify-content-md-center">
          <div className={clsx(classes.historyCollection)}>
            {config.app.enableHistory && wordsContent}
          </div>
        </Row>
      </Container>
    </Section>
  );
};

export default HistoryCollection;
