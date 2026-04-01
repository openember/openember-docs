import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import HomepageFeaturesEn from '@site/src/components/HomepageFeatures/en';
import {HomepageContact} from '@site/src/components/HomepageContact';
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
        <HomepageContact
          heading="Contact"
          lead="OpenEmber is under active development. Curious about the project or have questions? I'd be glad to hear from you."
          wechatLabel="WeChat"
          wechatId="Archimedong"
        />
      </main>
    </Layout>
  );
}
