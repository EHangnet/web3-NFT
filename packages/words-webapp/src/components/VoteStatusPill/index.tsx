import classes from './VoteStatusPill.module.css';

interface VoteStatusPillProps {
  status: string;
  text: string;
}

const VoteStatusPill: React.FC<VoteStatusPillProps> = props => {
  const { status, text } = props;
  switch (status) {
    case 'success':
      return (
        <div className={`${classes.pass} ${classes.wordButton}`}>
          {' '}
          <div className={classes.wordButtonContents}>{text}</div>
        </div>
      );
    case 'failure':
      return (
        <div className={`${classes.fail} ${classes.wordButton}`}>
          <div className={classes.wordButtonContents}>{text}</div>
        </div>
      );
    default:
      return (
        <div className={`${classes.pending} ${classes.wordButton}`}>
          <div className={classes.wordButtonContents}>{text}</div>
        </div>
      );
  }
};

export default VoteStatusPill;
