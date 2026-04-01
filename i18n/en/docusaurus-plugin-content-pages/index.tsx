import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import HomepageFeaturesEn from '@site/src/components/HomepageFeatures/en';

import styles from '@site/src/pages/index.module.css';

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          OpenEmber
        </Heading>
        <p className="hero__subtitle">
          Distributed embedded runtime for Linux — OpenEmber &amp; EmberLite
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="OpenEmber Documentation"
      description="OpenEmber and EmberLite: embedded Linux frameworks with a unified ember CLI and Kconfig + CMake workflow.">
      <HomepageHeader />
      <main>
        <HomepageFeaturesEn />
      </main>
    </Layout>
  );
}
