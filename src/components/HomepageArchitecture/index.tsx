import type {CSSProperties, ReactNode} from 'react';
import Link from '@docusaurus/Link';
import styles from './HomepageArchitecture.module.css';

export type ArchitectureLayer = {
  name: string;
  detail: string;
};

export type HomepageArchitectureProps = {
  eyebrow: string;
  title: string;
  lead: string;
  layers: ArchitectureLayer[];
  ctaLabel: string;
  ctaTo: string;
};

export function HomepageArchitecture({
  eyebrow,
  title,
  lead,
  layers,
  ctaLabel,
  ctaTo,
}: HomepageArchitectureProps): ReactNode {
  return (
    <section className={styles.section} aria-labelledby="homepage-architecture-heading">
      <div className="container">
        <div className={styles.layout}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h2 id="homepage-architecture-heading" className={styles.title}>
              {title}
            </h2>
            <p className={styles.lead}>{lead}</p>
            <Link className={styles.cta} to={ctaTo}>
              {ctaLabel} →
            </Link>
          </div>
          <ol className={styles.stack} aria-label={title}>
            {layers.map((layer, index) => (
              <li key={layer.name} className={styles.layer} style={{'--oe-layer-i': index} as CSSProperties}>
                <span className={styles.layerIndex}>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <span className={styles.layerName}>{layer.name}</span>
                  <span className={styles.layerDetail}>{layer.detail}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
