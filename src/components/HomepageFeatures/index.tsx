import type {ReactNode} from 'react';
import {FeatureCard} from './FeatureCard';
import {homepageFeatureIconPath} from './featureIcons';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  imagePath: string;
  imageAlt: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: '分布式中间件运行时',
    imagePath: homepageFeatureIconPath.distributed,
    imageAlt: '分布式与节点通信',
    description: (
      <>
        OpenEmber 面向机器人与智能设备，提供节点生命周期、话题发布/订阅、参数与服务等机制，模块可分布在不同硬件上协同工作。
      </>
    ),
  },
  {
    title: '分层架构与 HAL',
    imagePath: homepageFeatureIconPath.middleware,
    imageAlt: '分层架构与中间件',
    description: (
      <>
        从应用到平台清晰分层：应用 → 模块 → 组件 → 核心 → 平台（OS 抽象与 UART、GPIO、I2C 等硬件抽象），便于裁剪与扩展。
      </>
    ),
  },
  {
    title: 'EmberLite 与统一工具链',
    imagePath: homepageFeatureIconPath.buildTool,
    imageAlt: '构建工具链',
    description: (
      <>
        纯 C 的 EmberLite 适合资源受限场景；OpenEmber 与 EmberLite 共用{' '}
        <code>ember</code> CLI 与 Kconfig + CMake 流程，降低学习与集成成本。
      </>
    ),
  },
];

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <FeatureCard key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
