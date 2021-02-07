import styles from './blog.module.css';

const Blog = () => {
  return (
    <div className={styles.blog} id="blog">
      <h1 className={styles.blogTitle}>BLOG</h1>
      <div className={styles.blogArea} />
    </div>
  );
};

export default Blog;
