import React from 'react';
import { Image } from 'react-bootstrap';
import classes from './WordInfoRowButton.module.css';

interface WordInfoRowButtonProps {
  iconImgSource: string;
  btnText: string;
  onClickHandler: () => void;
}

const WordInfoRowButton: React.FC<WordInfoRowButtonProps> = props => {
  const { iconImgSource, btnText, onClickHandler } = props;
  return (
    <div className={classes.wordButton} onClick={onClickHandler}>
      <div className={classes.wordButtonContents}>
        <Image src={iconImgSource} className={classes.buttonIcon} />
        {btnText}
      </div>
    </div>
  );
};

export default WordInfoRowButton;
