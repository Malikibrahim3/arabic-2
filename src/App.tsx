import { Route, Switch } from 'wouter';
import { Layout } from './components/Layout';
import { LearnPage } from './pages/LearnPage';
import { LessonPage } from './pages/LessonPage';

function App() {
  return (
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
  );
}

export default App;
