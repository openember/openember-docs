import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  image: string;
  imageAlt: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Distributed middleware runtime',
    image: require('@site/static/img/distributed-icon.png').default,
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
    image: require('@site/static/img/middleware-icon.png').default,
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
    image: require('@site/static/img/build-tool-icon.png').default,
    imageAlt: 'Build tooling',
    description: (
      <>
        EmberLite keeps a pure C runtime for tight footprints; both stacks share the{' '}
        <code>ember</code> CLI and the Kconfig + CMake workflow.
      </>
    ),
  },
];

function Feature({title, image, imageAlt, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img
          className={styles.featureIcon}
          src={image}
          alt={imageAlt}
          loading="lazy"
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
