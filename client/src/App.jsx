import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const Landing = lazy(() => import('./pages/Landing'));
const CreateBoardPage = lazy(() => import('./pages/CreateBoardPage'));
const ShareInvitePage = lazy(() => import('./pages/ShareInvitePage'));
const JoinBoardPage = lazy(() => import('./pages/JoinBoardPage'));
const BoardPage = lazy(() => import('./pages/BoardPage'));
const RecoverRequestPage = lazy(() => import('./pages/RecoverRequestPage'));
const RecoverConfirmRoute = lazy(() => import('./pages/RecoverConfirmRoute'));

const RouteFallback = () => <div className="min-h-screen bg-background" />;

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/create" element={<CreateBoardPage />} />
          <Route path="/share/:inviteToken" element={<ShareInvitePage />} />
          <Route path="/join/:inviteToken" element={<JoinBoardPage />} />
          <Route path="/board/:boardId" element={<BoardPage />} />
          <Route path="/recover" element={<RecoverRequestPage />} />
          <Route path="/recover/confirm" element={<RecoverConfirmRoute />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
