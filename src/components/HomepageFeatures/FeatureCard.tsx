import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import {featureIconMap, type FeatureIconKey} from './FeatureIcons';
import styles from './styles.module.css';

export type FeatureCardProps = {
  title: string;
  icon: FeatureIconKey;
  summary: string;
  tags: string[];
};

export function FeatureCard({
  title,
  icon,
  summary,
  tags,
}: FeatureCardProps): ReactNode {
  const Icon = featureIconMap[icon];
  return (
    <div className={clsx('col col--4', styles.featureCol)}>
      <article className={styles.featureCard}>
        <div className={styles.featureIconWrap} aria-hidden>
          <Icon className={styles.featureIcon} />
        </div>
        <Heading as="h3" className={styles.featureTitle}>
          {title}
        </Heading>
        <p className={styles.featureSummary}>{summary}</p>
        <ul className={styles.featureTags}>
          {tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </article>
    </div>
  );
}
