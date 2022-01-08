import { Col } from 'react-bootstrap';
import Section from '../../layout/Section';
import { useAllProposals, useProposalThreshold } from '../../wrappers/wordsDao';
import Proposals from '../../components/Proposals';
import classes from './Governance.module.css';

const GovernancePage = () => {
  const { data: proposals } = useAllProposals();
  const threshold = useProposalThreshold();
  const wordsRequired = threshold !== undefined ? threshold + 1 : '...';
  const wordThresholdCopy = `${wordsRequired} ${threshold === 0 ? 'Word' : 'Words'}`;

  return (
    <Section fullWidth={true}>
      <Col lg={{ span: 8, offset: 2 }}>
        <h1 className={classes.heading}>Words DAO Governance</h1>
        <p className={classes.subheading}>
          Words govern WordsDAO. Words can vote on proposals or delegate their vote to a third
          party. A minimum of {wordThresholdCopy} is required to submit proposals.
        </p>
        <Proposals proposals={proposals} />
      </Col>
    </Section>
  );
};
export default GovernancePage;
