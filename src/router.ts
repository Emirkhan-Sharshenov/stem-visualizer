import { useEffect, useState } from 'react';

export type Route = 'landing' | 'login' | 'register' | 'app' | 'credits' | 'reset';

const ROUTES: Route[] = ['login', 'register', 'app', 'credits', 'reset'];

// Hash routing keeps deep links working without server rewrites: #/login, #/register, #/app
function parse(hash: string): Route {
  // #/app?lab=space3d: the query only picks a section inside the app
  const path = hash.replace(/^#\/?/, '').split('?')[0];
  return (ROUTES as string[]).includes(path) ? (path as Route) : 'landing';
}

export function navigate(route: Route) {
  window.location.hash = route === 'landing' ? '/' : `/${route}`;
  window.scrollTo(0, 0);
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
