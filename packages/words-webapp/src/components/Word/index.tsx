import classes from './Word.module.css';
import React from 'react';
import loadingWord from '../../assets/loading-skull-word.gif';
import Image from 'react-bootstrap/Image';

export const LoadingWord = () => {
  return (
    <div className={classes.imgWrapper}>
      <Image className={classes.img} src={loadingWord} alt={'loading word'} fluid />
    </div>
  );
};

const Word: React.FC<{
  imgPath: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
}> = props => {
  const { imgPath, alt, className, wrapperClassName } = props;
  return (
    <div className={`${classes.imgWrapper} ${wrapperClassName}`}>
      <Image
        className={`${classes.img} ${className}`}
        src={imgPath ? imgPath : loadingWord}
        alt={alt}
        fluid
      />
    </div>
  );
};

export default Word;
