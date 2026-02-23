import { Route, Switch } from 'wouter';
import { Layout } from './components/Layout';
import { LearnPage } from './pages/LearnPage';
import { CharactersPage } from './pages/CharactersPage';
import { QuestsPage } from './pages/QuestsPage';
import { ProfilePage } from './pages/ProfilePage';
import { LessonPage } from './pages/LessonPage';

function App() {
  return (
    <Switch>
      {/* Lesson page is rendered full-screen without the Layout shell */}
      <Route path="/lesson/:id" component={LessonPage} />

      {/* All other pages use the standard Layout with TopNav + BottomNav */}
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={LearnPage} />
            <Route path="/characters" component={CharactersPage} />
            <Route path="/quests" component={QuestsPage} />
            <Route path="/profile" component={ProfilePage} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

export default App;
