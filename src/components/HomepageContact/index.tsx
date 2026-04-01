import type {ReactNode} from 'react';
import Heading from '@theme/Heading';
import styles from './HomepageContact.module.css';

export type HomepageContactProps = {
  heading: string;
  /** 引导说明（欢迎语、项目状态等） */
  lead: string;
  /** 如「微信」/「WeChat」 */
  wechatLabel: string;
  wechatId: string;
};

export function HomepageContact({
  heading,
  lead,
  wechatLabel,
  wechatId,
}: HomepageContactProps): ReactNode {
  return (
    <section className={styles.section} aria-labelledby="homepage-contact-heading">
      <div className="container">
        <div className={styles.wrap}>
          <div className={styles.card}>
            <Heading as="h2" id="homepage-contact-heading" className={styles.heading}>
              {heading}
            </Heading>
            <p className={styles.lead}>{lead}</p>
            <div className={styles.wechatBlock}>
              <span className={styles.wechatLabel}>{wechatLabel}</span>
              <span className={styles.wechatId}>{wechatId}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
