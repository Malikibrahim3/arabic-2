import { Route, Switch } from 'wouter';
import { Layout } from './components/Layout';
import { LearnPage } from './pages/LearnPage';
import { LessonPage } from './pages/LessonPage';
import { useState, useEffect } from 'react';
import { YasmineGate } from './components/YasmineGate';

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const unlocked = sessionStorage.getItem('yasmine_unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  const handleUnlock = () => {
    sessionStorage.setItem('yasmine_unlocked', 'true');
    setIsUnlocked(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('yasmine_unlocked');
    setIsUnlocked(false);
  };

  if (!isUnlocked) {
    return <YasmineGate onUnlock={handleUnlock} />;
  }

  return (
    <Switch>
      {/* Lesson page is rendered full-screen without the Layout shell */}
      <Route path="/lesson/:id" component={LessonPage} />

      {/* Main page with TopNav */}
      <Route>
        <Layout onLogout={handleLogout}>
          <LearnPage />
        </Layout>
      </Route>
    </Switch>
  );
}

export default App;
