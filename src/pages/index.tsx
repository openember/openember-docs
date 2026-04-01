import type {ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import {HomepageContact} from '@site/src/components/HomepageContact';
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
        <HomepageContact
          heading="联系我们"
          lead="项目正在持续开发中。如果你对 OpenEmber 感兴趣，或者有任何疑问，欢迎联系我～"
          wechatLabel="微信："
          wechatId="Archimedong"
        />
      </main>
    </Layout>
  );
}
