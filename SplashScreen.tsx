import { useEffect } from 'react';
import logoWhite from '../assets/TaskUp.png';
import firstText from '../assets/first text.png';
import secondText from '../assets/second text.png';
import thirdText from '../assets/third text.png';
import firstCharacter from '../assets/first character.png';
import secondCharacter from '../assets/second character.png';
import thirdCharacter from '../assets/third character.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    // total animation duration from original loading.html (~13.5s) + small buffer
    const timeout = setTimeout(() => {
      onComplete();
    }, 14000);

    return () => {
      clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <div className="splash-loader">
      <div className="loader-wrapper">
        <img src={logoWhite} alt="TaskUp Logo" className="loader-logo" />

        {/* First sequence */}
        <img src={firstText} alt="First Text" className="first-text" />
        <img src={firstText} alt="Ezy Text" className="ezy-text" />
        <div className="character-1-container">
          <img src={firstCharacter} alt="Character 1" className="character-1" />
        </div>

        {/* Second sequence */}
        <img src={secondText} alt="Second Text" className="second-text" />
        <img src={secondText} alt="Ezy Text 2" className="ezy-text-2" />
        <div className="character-2-container">
          <img src={secondCharacter} alt="Character 2" className="character-2" />
        </div>

        {/* Third sequence */}
        <img src={thirdText} alt="Third Text" className="third-text" />
        <img src={thirdText} alt="Ezy Text 3" className="ezy-text-3" />
        <div className="character-3-container">
          <img src={thirdCharacter} alt="Character 3" className="character-3" />
        </div>
      </div>
    </div>
  );
}
