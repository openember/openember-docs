import type {ReactNode} from 'react';
import {FeatureCard} from './FeatureCard';
import {homepageFeatureIconPath} from './featureIcons';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  imagePath: string;
  imageAlt: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Distributed middleware runtime',
    imagePath: homepageFeatureIconPath.distributed,
    imageAlt: 'Distributed nodes and messaging',
    description: (
      <>
        OpenEmber targets robotics and smart devices with node lifecycles, pub/sub messaging,
        parameters, and services—modules can run on different boards and still work together.
      </>
    ),
  },
  {
    title: 'Layered architecture & HAL',
    imagePath: homepageFeatureIconPath.middleware,
    imageAlt: 'Layered middleware stack',
    description: (
      <>
        Clear stack from apps down to modules, components, core, and platform—OS abstractions
        plus UART, GPIO, I2C, and more for portable embedded code.
      </>
    ),
  },
  {
    title: 'EmberLite & shared tooling',
    imagePath: homepageFeatureIconPath.buildTool,
    imageAlt: 'Build tooling',
    description: (
      <>
        EmberLite keeps a pure C runtime for tight footprints; both stacks share the{' '}
        <code>ember</code> CLI and the Kconfig + CMake workflow.
      </>
    ),
  },
];

export default function HomepageFeaturesEn(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <FeatureCard key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
