import { ImageData as data, getWordData } from '@words/assets';
import { buildSVG } from '@words/sdk';
import { BigNumber as EthersBN } from 'ethers';
import { IWordSeed, useWordSeed } from '../../wrappers/wordToken';
import Word from '../Word';
import { Link } from 'react-router-dom';
import classes from './StandaloneWord.module.css';

interface StandaloneWordProps {
  wordId: EthersBN;
}

interface StandaloneWordWithSeedProps {
  wordId: EthersBN;
  onLoadSeed?: (seed: IWordSeed) => void;
  shouldLinkToProfile: boolean;
}

const getWord = (wordId: string | EthersBN, seed: IWordSeed) => {
  const id = wordId.toString();
  const name = `Word ${id}`;
  const description = `Word ${id} is a member of the Words DAO`;
  const { parts, background } = getWordData(seed);
  const image = `data:image/svg+xml;base64,${btoa(buildSVG(parts, data.palette, background))}`;

  return {
    name,
    description,
    image,
  };
};

const StandaloneWord: React.FC<StandaloneWordProps> = (props: StandaloneWordProps) => {
  const { wordId } = props;
  const seed = useWordSeed(wordId);
  const word = seed && getWord(wordId, seed);

  return (
    <Link to={'/word/' + wordId.toString()} className={classes.clickableWord}>
      <Word imgPath={word ? word.image : ''} alt={word ? word.description : 'Word'} />
    </Link>
  );
};

export const StandaloneWordWithSeed: React.FC<StandaloneWordWithSeedProps> = (
  props: StandaloneWordWithSeedProps,
) => {
  const { wordId, onLoadSeed, shouldLinkToProfile } = props;

  const seed = useWordSeed(wordId);

  if (!seed || !wordId || !onLoadSeed) return <Word imgPath="" alt="Word" />;

  onLoadSeed(seed);

  const { image, description } = getWord(wordId, seed);

  const word = <Word imgPath={image} alt={description} />;
  const wordWithLink = (
    <Link to={'/word/' + wordId.toString()} className={classes.clickableWord}>
      {word}
    </Link>
  );
  return shouldLinkToProfile ? wordWithLink : word;
};

export default StandaloneWord;
