import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Heading from '@theme/Heading';
import {HeroDecor} from './HeroDecor';
import styles from './HomepageHero.module.css';

export type HomepageHeroProps = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaTo: string;
  secondaryCtaLabel?: string;
  secondaryCtaTo?: string;
};

export function HomepageHero({
  title,
  subtitle,
  ctaLabel,
  ctaTo,
  secondaryCtaLabel = '架构概览',
  secondaryCtaTo = '/docs/architecture-overview',
}: HomepageHeroProps): ReactNode {
  const logoSrc = useBaseUrl('/img/logo.png');

  return (
    <header className={styles.heroBanner}>
      <div className={clsx('container', styles.heroInner)}>
        <div className={styles.heroContent}>
          <div className={styles.brandMark}>
            <img
              className={styles.brandLogo}
              src={logoSrc}
              alt=""
              width={44}
              height={44}
              decoding="async"
            />
          </div>
          <Heading as="h1" className={styles.heroTitle}>
            {title}
          </Heading>
          <p className={styles.heroSubtitle}>{subtitle}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx('button button--lg', styles.ctaPrimary)}
              to={ctaTo}>
              {ctaLabel}
            </Link>
            {secondaryCtaLabel && secondaryCtaTo ? (
              <Link
                className={clsx('button button--lg', styles.ctaSecondary)}
                to={secondaryCtaTo}>
                {secondaryCtaLabel}
              </Link>
            ) : null}
          </div>
        </div>
        <HeroDecor />
      </div>
    </header>
  );
}
