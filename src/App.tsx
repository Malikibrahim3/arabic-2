import { Route, Switch, useLocation } from 'wouter';
import { Layout } from './components/Layout';
import { LearnPage } from './pages/LearnPage';
import { LessonPage } from './pages/LessonPage';
import { PathSelectionPage } from './pages/PathSelectionPage';
import { DialectSelectionPage } from './pages/DialectSelectionPage';
import { ProgressDashboard } from './pages/ProgressDashboard';
import { OnboardingPage } from './pages/OnboardingPage';
import { PlacementTestPage } from './pages/PlacementTestPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DialectProvider, useDialect } from './context/DialectContext';
import { useEffect } from 'react';

function AppRoutes() {
  const { currentDialect } = useDialect();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const hasOnboarded = localStorage.getItem('onboarding_completed');
    if (!hasOnboarded && location !== '/onboarding' && location !== '/placement-test') {
      setLocation('/onboarding');
      return;
    }
    if (!currentDialect && location !== '/select-dialect' && location !== '/onboarding') {
      setLocation('/select-dialect');
    }
  }, [currentDialect, location, setLocation]);

  return (
    <Switch>
      <Route path="/onboarding">
        {() => <OnboardingPage onComplete={() => setLocation('/select-dialect')} />}
      </Route>
      <Route path="/select-dialect" component={DialectSelectionPage} />
      <Route path="/placement-test" component={PlacementTestPage} />

      {/* Lesson page is rendered full-screen without the Layout shell */}
      <Route path="/lesson/:id" component={LessonPage} />

      {/* Progress Dashboard */}
      <Route path="/progress">
        {() => (
          <Layout>
            <ProgressDashboard />
          </Layout>
        )}
      </Route>

      {/* Path-specific learn pages with TopNav */}
      <Route path="/learn/:pathType">
        {(params: { pathType: string }) => (
          <Layout>
            <LearnPage pathType={params.pathType as 'reading' | 'speaking' | 'hybrid'} />
          </Layout>
        )}
      </Route>

      {/* Home: Path Selection (full-screen, no Layout) */}
      <Route path="/" component={PathSelectionPage} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <DialectProvider>
        <AppRoutes />
      </DialectProvider>
    </ErrorBoundary>
  );
}

export default App;
