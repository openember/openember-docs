import type {ReactNode} from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  imageUrl: string;
  imageAlt: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Distributed middleware runtime',
    imageUrl: '/img/distributed-icon.png',
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
    imageUrl: '/img/middleware-icon.png',
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
    imageUrl: '/img/build-tool-icon.png',
    imageAlt: 'Build tooling',
    description: (
      <>
        EmberLite keeps a pure C runtime for tight footprints; both stacks share the{' '}
        <code>ember</code> CLI and the Kconfig + CMake workflow.
      </>
    ),
  },
];

function Feature({title, imageUrl, imageAlt, description}: FeatureItem) {
  const src = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img
          className={styles.featureIcon}
          src={src}
          alt={imageAlt}
          loading="lazy"
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

export default function HomepageFeaturesEn(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
