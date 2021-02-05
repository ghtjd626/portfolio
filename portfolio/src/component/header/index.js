import styles from './header.module.scss';

const Header = () => {
  return (
    <>
      <nav className={styles.headerNav}>
        <a href="#home">HOME</a>
        <a href="#about">ABOUT</a>
        <a href="/">PORTFOLIO</a>
        <a href="/">BLOG</a>
        <a href="/">CONTACT</a>
      </nav>
    </>
  );
};

export default Header;
