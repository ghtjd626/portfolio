import styles from './footer.module.css';

const Footer = () => {
  return (
    <div className={styles.footer} id="footer">
      <div className={styles.footerBackground} />
      <div className={styles.footerBackGroundBottom}>Designed by Yujin</div>
    </div>
  );
};

export default Footer;
