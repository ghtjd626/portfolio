import styles from './portfolio.module.css';

const Portfolio = () => {
  return (
    <div className={styles.portfolio} id="portfolio">
      <h1 className={styles.portfolioTitle}>PORTFOLIO</h1>
      <div className={styles.portfolioArea} />
    </div>
  );
};

export default Portfolio;
