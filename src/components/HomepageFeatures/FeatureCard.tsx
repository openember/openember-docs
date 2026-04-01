import type {ReactNode} from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

export type FeatureCardProps = {
  title: string;
  /** Path served from static/, e.g. `/img/foo.png` → `static/img/foo.png`. */
  imagePath: string;
  imageAlt: string;
  description: ReactNode;
};

export function FeatureCard({
  title,
  imagePath,
  imageAlt,
  description,
}: FeatureCardProps) {
  const src = useBaseUrl(imagePath);
  return (
    <div className={clsx('col col--4')}>
      <div className={clsx('text--center', styles.featureIconWrap)}>
        <img
          className={styles.featureIcon}
          src={src}
          alt={imageAlt}
          width={200}
          height={200}
          decoding="async"
        />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}
