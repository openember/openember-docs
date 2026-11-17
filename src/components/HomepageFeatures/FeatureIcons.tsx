import type {ReactNode, SVGProps} from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function baseProps(props: IconProps): IconProps {
  return {
    width: 40,
    height: 40,
    viewBox: '0 0 40 40',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...props,
  };
}

/** 节点通信 / 分布式 */
export function IconDistributed(props: IconProps): ReactNode {
  return (
    <svg {...baseProps(props)}>
      <circle cx="10" cy="12" r="3.25" />
      <circle cx="30" cy="10" r="3.25" />
      <circle cx="20" cy="28" r="3.25" />
      <circle cx="30" cy="26" r="2.5" />
      <path d="M13 13.5 17.5 25.5M27.2 12.2 22.2 25.2M27.2 12.5 28.2 23.2" />
    </svg>
  );
}

/** 分层架构 */
export function IconLayers(props: IconProps): ReactNode {
  return (
    <svg {...baseProps(props)}>
      <path d="M6 14 20 7l14 7-14 7L6 14Z" />
      <path d="M6 20.5 20 27.5l14-7" />
      <path d="M6 26.5 20 33.5l14-7" />
    </svg>
  );
}

/** 工具链 / CLI */
export function IconToolchain(props: IconProps): ReactNode {
  return (
    <svg {...baseProps(props)}>
      <rect x="5" y="7" width="30" height="26" rx="3" />
      <path d="M11 16h7M11 22h12" />
      <path d="M26 15.5 30 19.5 26 23.5" />
    </svg>
  );
}

export const featureIconMap = {
  distributed: IconDistributed,
  layers: IconLayers,
  toolchain: IconToolchain,
} as const;

export type FeatureIconKey = keyof typeof featureIconMap;
