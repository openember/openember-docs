import type {ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import {HomepageArchitecture} from '@site/src/components/HomepageArchitecture';
import {HomepageContact} from '@site/src/components/HomepageContact';
import {HomepageHero} from '@site/src/components/HomepageHero';

const ARCH_LAYERS = [
  {name: 'Application', detail: 'apps / system / services / examples / tools'},
  {name: 'Middleware', detail: 'Link 通信 · 节点生命周期 · 调度与参数'},
  {name: 'Components', detail: '日志 · 算法 · 序列化 · 配置解析'},
  {name: 'Platform', detail: 'OS 抽象 · UART / GPIO / I2C · 线程与定时器'},
];

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
        secondaryCtaLabel="架构概览"
        secondaryCtaTo="/docs/architecture-overview"
      />
      <main>
        <HomepageFeatures />
        <HomepageArchitecture
          eyebrow="Architecture"
          title="清晰四层，依赖自上而下"
          lead="从产品应用到平台 HAL 分层明确，便于裁剪、移植与长期维护；上层可依赖下层，避免反向耦合。"
          layers={ARCH_LAYERS}
          ctaLabel="阅读架构概览"
          ctaTo="/docs/architecture-overview"
        />
        <HomepageContact
          heading="加入社区"
          lead="项目正在持续开发中。如果你对 OpenEmber 感兴趣，或者有任何疑问，欢迎通过微信或 GitHub 联系。"
          wechatLabel="微信"
          wechatId="Archimedong"
        />
      </main>
    </Layout>
  );
}
