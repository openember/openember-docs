import type {ReactNode} from 'react';
import {FeatureCard, type FeatureCardProps} from './FeatureCard';
import styles from './styles.module.css';

const FeatureList: FeatureCardProps[] = [
  {
    title: '分布式中间件运行时',
    icon: 'distributed',
    summary: '节点生命周期、话题发布/订阅、参数与服务；模块可分布在不同硬件上协同工作。',
    tags: ['Pub/Sub', '参数', '服务'],
  },
  {
    title: '分层架构与 HAL',
    icon: 'layers',
    summary: '应用 → 中间件 → 组件 → 平台，配合 UART / GPIO / I2C 等抽象，便于裁剪与移植。',
    tags: ['分层', 'HAL', '可裁剪'],
  },
  {
    title: 'EmberLite 与统一工具链',
    icon: 'toolchain',
    summary: '纯 C 的 EmberLite 适配资源受限场景；与 OpenEmber 共用 ember CLI 与 Kconfig + CMake。',
    tags: ['ember CLI', 'Kconfig', 'CMake'],
  },
];

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <header className={styles.sectionHeading}>
          <p className={styles.sectionEyebrow}>Capabilities</p>
          <h2 className={styles.sectionTitle}>为嵌入式 Linux 产品打造的运行时底座</h2>
        </header>
        <div className="row">
          {FeatureList.map((props) => (
            <FeatureCard key={props.title} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
