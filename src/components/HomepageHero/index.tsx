import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import {HeroDecor} from './HeroDecor';
import styles from './HomepageHero.module.css';

export type HomepageHeroProps = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaTo: string;
};

export function HomepageHero({
  title,
  subtitle,
  ctaLabel,
  ctaTo,
}: HomepageHeroProps): ReactNode {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <Heading as="h1" className={clsx('hero__title', styles.heroTitle)}>
            {title}
          </Heading>
          <p className={clsx('hero__subtitle', styles.heroSubtitle)}>{subtitle}</p>
          <div className={styles.buttons}>
            <Link className="button button--secondary button--lg" to={ctaTo}>
              {ctaLabel}
            </Link>
          </div>
        </div>
        <HeroDecor />
      </div>
    </header>
  );
}
