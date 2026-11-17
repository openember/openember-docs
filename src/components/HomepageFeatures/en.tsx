import type {ReactNode} from 'react';
import {FeatureCard, type FeatureCardProps} from './FeatureCard';
import styles from './styles.module.css';

const FeatureList: FeatureCardProps[] = [
  {
    title: 'Distributed middleware runtime',
    icon: 'distributed',
    summary:
      'Node lifecycle, pub/sub messaging, parameters, and services—modules can run across boards and still work together.',
    tags: ['Pub/Sub', 'Params', 'Services'],
  },
  {
    title: 'Layered architecture & HAL',
    icon: 'layers',
    summary:
      'Application → middleware → components → platform, with UART / GPIO / I2C abstractions for portable embedded code.',
    tags: ['Layers', 'HAL', 'Portable'],
  },
  {
    title: 'EmberLite & shared tooling',
    icon: 'toolchain',
    summary:
      'A pure-C EmberLite runtime for tight footprints; both stacks share the ember CLI and Kconfig + CMake workflow.',
    tags: ['ember CLI', 'Kconfig', 'CMake'],
  },
];

export default function HomepageFeaturesEn(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <header className={styles.sectionHeading}>
          <p className={styles.sectionEyebrow}>Capabilities</p>
          <h2 className={styles.sectionTitle}>A runtime base for embedded Linux products</h2>
        </header>
        <div className="row">
          {FeatureList.map((props) => (
            <FeatureCard key={props.title} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
