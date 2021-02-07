import { Typewriter } from 'react-typewriting-effect';
import styles from './home.module.css';
import Header from '../header';

const Home = () => {
  return (
    <>
      <div className={styles.home} id="home">
        <div className={styles.homeBackground}>
          <Header />
          <div className={styles.homeTitle}>
            <Typewriter
              string="Hello, I'm Keun Ho"
              className={styles.homeText}
            />
            <Typewriter
              string="I'm a Web Developer"
              className={styles.homeText}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
