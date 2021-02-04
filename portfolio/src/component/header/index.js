import styles from './header.module.css';

const Header = () => {
  const scroll = () => {
    window.scrollBy({ top: 801, left: 0, behavior: 'smooth' });
  };

  return (
    <>
      <nav className={styles.headerNav}>
        <a href="#home">HOME</a>
        <a href="#about" onClick={scroll}>
          ABOUT
        </a>
        <a href="/">PORTFOLIO</a>
        <a href="/">BLOG</a>
        <a href="/">CONTACT</a>
      </nav>
    </>
  );
};

export default Header;
