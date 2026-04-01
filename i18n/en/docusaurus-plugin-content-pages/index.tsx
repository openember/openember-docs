import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import HomepageFeaturesEn from '@site/src/components/HomepageFeatures/en';
import {HomepageHero} from '@site/src/components/HomepageHero';

export default function Home(): ReactNode {
  return (
    <Layout
      title="OpenEmber Documentation"
      description="OpenEmber and EmberLite: embedded Linux frameworks with a unified ember CLI and Kconfig + CMake workflow.">
      <HomepageHero
        title="OpenEmber"
        subtitle="Distributed embedded runtime for Linux — OpenEmber & EmberLite"
        ctaLabel="Get started"
        ctaTo="/docs/intro"
      />
      <main>
        <HomepageFeaturesEn />
      </main>
    </Layout>
  );
}
