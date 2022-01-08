import { BigNumber } from 'ethers';
import React from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import { StandaloneWordWithSeed } from '../../components/StandaloneWord';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setStateBackgroundColor } from '../../state/slices/application';
import { grey, beige } from '../../utils/wordBgColors';
import { IWordSeed } from '../../wrappers/wordToken';

import classes from './Profile.module.css';

import WordInfoCard from '../../components/WordInfoCard';
import ProfileActivityFeed from '../../components/ProfileActivityFeed';

interface ProfilePageProps {
  wordId: number;
}

const ProfilePage: React.FC<ProfilePageProps> = props => {
  const { wordId } = props;

  const dispatch = useAppDispatch();
  const lastAuctionWordId = useAppSelector(state => state.onDisplayAuction.lastAuctionWordId);
  let stateBgColor = useAppSelector(state => state.application.stateBackgroundColor);

  const loadedWordHandler = (seed: IWordSeed) => {
    dispatch(setStateBackgroundColor(seed.background === 0 ? grey : beige));
  };

  if (!lastAuctionWordId) {
    return <></>;
  }

  const wordIdForDisplay = Math.min(wordId, lastAuctionWordId);

  const wordContent = (
    <StandaloneWordWithSeed
      wordId={BigNumber.from(wordIdForDisplay)}
      onLoadSeed={loadedWordHandler}
      shouldLinkToProfile={false}
    />
  );

  return (
    <>
      <div style={{ backgroundColor: stateBgColor }}>
        <Container>
          <Row>
            <Col lg={6}>{wordContent}</Col>
            <Col lg={6} className={classes.wordProfileInfo}>
              <WordInfoCard wordId={wordIdForDisplay} />
            </Col>
          </Row>
        </Container>
      </div>
      <ProfileActivityFeed wordId={wordIdForDisplay} />
    </>
  );
};

export default ProfilePage;
