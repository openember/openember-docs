import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import styles from './HomepageContact.module.css';

export type HomepageContactProps = {
  heading: string;
  lead: string;
  wechatLabel: string;
  wechatId: string;
  githubLabel?: string;
  githubHref?: string;
};

export function HomepageContact({
  heading,
  lead,
  wechatLabel,
  wechatId,
  githubLabel = 'GitHub',
  githubHref = 'https://github.com/openember/openember',
}: HomepageContactProps): ReactNode {
  return (
    <section className={styles.section} aria-labelledby="homepage-contact-heading">
      <div className="container">
        <div className={styles.panel}>
          <div className={styles.copy}>
            <h2 id="homepage-contact-heading" className={styles.heading}>
              {heading}
            </h2>
            <p className={styles.lead}>{lead}</p>
          </div>
          <div className={styles.actions}>
            <div className={styles.chip}>
              <span className={styles.chipLabel}>{wechatLabel}</span>
              <span className={styles.chipValue}>{wechatId}</span>
            </div>
            <Link className={styles.github} href={githubHref}>
              {githubLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
