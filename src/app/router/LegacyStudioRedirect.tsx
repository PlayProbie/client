import { Navigate, useLocation } from 'react-router-dom';

export default function LegacyStudioRedirect() {
  const location = useLocation();
  const targetPath = location.pathname.replace('/studio/games', '/games');

  return (
    <Navigate
      to={targetPath}
      replace
    />
  );
}
