import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: '分布式中间件运行时',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        OpenEmber 面向机器人与智能设备，提供节点生命周期、话题发布/订阅、参数与服务等机制，模块可分布在不同硬件上协同工作。
      </>
    ),
  },
  {
    title: '分层架构与 HAL',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        从应用到平台清晰分层：应用 → 模块 → 组件 → 核心 → 平台（OS 抽象与 UART、GPIO、I2C 等硬件抽象），便于裁剪与扩展。
      </>
    ),
  },
  {
    title: 'EmberLite 与统一工具链',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        纯 C 的 EmberLite 适合资源受限场景；OpenEmber 与 EmberLite 共用{' '}
        <code>ember</code> CLI 与 Kconfig + CMake 流程，降低学习与集成成本。
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
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
