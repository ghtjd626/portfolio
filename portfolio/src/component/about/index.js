import styles from './about.module.css';

const About = () => {
  return (
    <div className={styles.about} id="about">
      <h1 className={styles.aboutTitle}>ABOUT</h1>
      <div className={styles.aboutArea}>
        <div className={styles.aboutProfile}>
          <div className={styles.aboutImg}>사진</div>
          <div className={styles.aboutMyStory}>my story</div>
        </div>
        <div>그래프</div>
      </div>
    </div>
  );
};

export default About;
