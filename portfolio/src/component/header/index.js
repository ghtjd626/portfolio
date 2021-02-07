import { useState } from 'react';
import styles from './header.module.scss';

const Header = () => {
  const [isHeaderTop, setIsHeaderTop] = useState(styles.TopFirst);

  const getCurrentScrollPercentage = () => {
    return (
      ((window.scrollY + window.innerHeight) / document.body.clientHeight) * 100
    );
  };

  document.addEventListener('scroll', () => {
    const currentScrollPercentage = getCurrentScrollPercentage();
    if (currentScrollPercentage > 30) {
      setIsHeaderTop(styles.TopSecond);
    } else {
      setIsHeaderTop(styles.TopFirst);
    }
  });

  return (
    <>
      <nav className={isHeaderTop}>
        <a href="#home">HOME</a>
        <a href="#about">ABOUT</a>
        <a href="#portfolio">PORTFOLIO</a>
        <a href="#blog">BLOG</a>
        <a href="#contact">CONTACT</a>
      </nav>
    </>
  );
};

export default Header;
