import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

declare global {
  interface Window {
    _hmt?: Array<unknown[]>;
  }
}

/** Docusaurus 客户端路由切换时补报百度统计 PV */
export function onRouteDidUpdate({
  location,
  previousLocation,
}: {
  location: {pathname: string; search: string};
  previousLocation?: {pathname: string; search: string} | null;
}): void {
  if (!ExecutionEnvironment.canUseDOM) {
    return;
  }
  if (
    previousLocation &&
    location.pathname === previousLocation.pathname &&
    location.search === previousLocation.search
  ) {
    return;
  }
  const path = `${location.pathname}${location.search}`;
  window._hmt = window._hmt || [];
  window._hmt.push(['_trackPageview', path]);
}
