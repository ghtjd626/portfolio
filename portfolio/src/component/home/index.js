import styles from './home.module.css';

const Home = () => {
  return (
    <>
      <div className={styles.home}>
        <div className={styles.homeBackground}>
          <div className={styles.homeTitle}>
            <h1 className={styles.homeText}>Hello, Im Keun Ho</h1>
            <h1 className={styles.homeText}>Im a Web Developer</h1>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
