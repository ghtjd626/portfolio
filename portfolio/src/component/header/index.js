import { useState } from 'react';
import styles from './header.module.scss';

const Header = () => {
  const [isHeaderTop, setIsHeaderTop] = useState(styles.headerNav);

  document.addEventListener('scroll', () => {
    if (window.scrollY > 800) {
      setIsHeaderTop(styles.headerNavActive);
    } else {
      setIsHeaderTop(styles.headerNav);
    }
  });

  return (
    <>
      <nav className={isHeaderTop} style={{ position: isHeaderTop }}>
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
