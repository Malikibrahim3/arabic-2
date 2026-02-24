import { Route, Switch } from 'wouter';
import { Layout } from './components/Layout';
import { LearnPage } from './pages/LearnPage';
import { LessonPage } from './pages/LessonPage';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Switch>
        {/* Lesson page is rendered full-screen without the Layout shell */}
        <Route path="/lesson/:id" component={LessonPage} />

        {/* Main page with TopNav */}
        <Route>
          <Layout>
            <LearnPage />
          </Layout>
        </Route>
      </Switch>
    </ErrorBoundary>
  );
}

export default App;
