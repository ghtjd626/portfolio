import styles from './contact.module.css';

const Contact = () => {
  return (
    <div className={styles.contact} id="contact">
      <div className={styles.contactBackGround}>
        <h1 className={styles.contactTitle}>CONTACT</h1>
        <div className={styles.contactArea}>
          <div className={styles.contactLogo1} />
          <div className={styles.contactLogo2} />
          <div className={styles.contactLogo3} />
        </div>
      </div>
    </div>
  );
};

export default Contact;
