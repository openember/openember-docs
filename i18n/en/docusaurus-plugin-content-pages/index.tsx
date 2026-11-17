import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import HomepageFeaturesEn from '@site/src/components/HomepageFeatures/en';
import {HomepageArchitecture} from '@site/src/components/HomepageArchitecture';
import {HomepageContact} from '@site/src/components/HomepageContact';
import {HomepageHero} from '@site/src/components/HomepageHero';

const ARCH_LAYERS = [
  {name: 'Application', detail: 'apps / system / services / examples / tools'},
  {name: 'Middleware', detail: 'Link messaging · node lifecycle · scheduling & params'},
  {name: 'Components', detail: 'logging · algorithms · serialization · config'},
  {name: 'Platform', detail: 'OS abstraction · UART / GPIO / I2C · threads & timers'},
];

export default function Home(): ReactNode {
  return (
    <Layout
      title="OpenEmber Documentation"
      description="OpenEmber and EmberLite: embedded Linux frameworks with a unified ember CLI and Kconfig + CMake workflow.">
      <HomepageHero
        title="OpenEmber"
        subtitle="Distributed application framework and lightweight runtime for embedded Linux"
        ctaLabel="Get started"
        ctaTo="/docs/intro"
        secondaryCtaLabel="Architecture"
        secondaryCtaTo="/docs/architecture-overview"
      />
      <main>
        <HomepageFeaturesEn />
        <HomepageArchitecture
          eyebrow="Architecture"
          title="Four clear layers, top-down dependencies"
          lead="A clean stack from product apps to platform HAL—easy to trim, port, and maintain without reverse coupling."
          layers={ARCH_LAYERS}
          ctaLabel="Read the architecture overview"
          ctaTo="/docs/architecture-overview"
        />
        <HomepageContact
          heading="Join the community"
          lead="OpenEmber is under active development. Curious about the project or have questions? Reach out via WeChat or GitHub."
          wechatLabel="WeChat"
          wechatId="Archimedong"
        />
      </main>
    </Layout>
  );
}
