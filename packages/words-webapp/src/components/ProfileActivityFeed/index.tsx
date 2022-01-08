import React from 'react';
import { Col, Table } from 'react-bootstrap';
import Section from '../../layout/Section';
import classes from './ProfileActivityFeed.module.css';

import { useQuery } from '@apollo/client';
import { Proposal, useAllProposals } from '../../wrappers/wordsDao';
import { wordVotingHistoryQuery } from '../../wrappers/subgraph';
import WordProfileVoteRow from '../WordProfileVoteRow';
import { LoadingWord } from '../Word';

interface ProfileActivityFeedProps {
  wordId: number;
}

interface ProposalInfo {
  id: number;
}

export interface WordVoteHistory {
  proposal: ProposalInfo;
  support: boolean;
  supportDetailed: number;
}

const ProfileActivityFeed: React.FC<ProfileActivityFeedProps> = props => {
  const { wordId } = props;

  const { loading, error, data } = useQuery(wordVotingHistoryQuery(wordId));
  const { data: proposals } = useAllProposals();

  if (loading) {
    return <></>;
  } else if (error) {
    return <div>Failed to fetch word activity history</div>;
  }

  const wordVotes: { [key: string]: WordVoteHistory } = data.word.votes
    .slice(0)
    .reduce((acc: any, h: WordVoteHistory, i: number) => {
      acc[h.proposal.id] = h;
      return acc;
    }, {});

  const latestProposalId = proposals?.length;

  return (
    <Section fullWidth={false}>
      <Col lg={{ span: 10, offset: 1 }}>
        <div className={classes.headerWrapper}>
          <h1>Activity</h1>
        </div>

        <Table responsive hover>
          <tbody className={classes.wordInfoPadding}>
            {proposals?.length ? (
              proposals
                .slice(0)
                .reverse()
                .map((p: Proposal, i: number) => {
                  const vote = p.id ? wordVotes[p.id] : undefined;
                  return (
                    <WordProfileVoteRow
                      proposal={p}
                      vote={vote}
                      latestProposalId={latestProposalId}
                      wordId={wordId}
                      key={i}
                    />
                  );
                })
            ) : (
              <LoadingWord />
            )}
          </tbody>
        </Table>
      </Col>
    </Section>
  );
};

export default ProfileActivityFeed;
