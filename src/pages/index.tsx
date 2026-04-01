import type {ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import {HomepageHero} from '@site/src/components/HomepageHero';

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} 文档`}
      description="OpenEmber 与 EmberLite：面向嵌入式 Linux 的分布式应用框架与轻量级 C 运行时，统一 ember 工具链与 Kconfig + CMake 构建。">
      <HomepageHero
        title={siteConfig.title}
        subtitle={siteConfig.tagline}
        ctaLabel="快速开始"
        ctaTo="/docs/intro"
      />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
