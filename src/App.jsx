import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Planning } from './pages/Planning';
import { Tasks } from './pages/Tasks';
import { Inspiration } from './pages/Inspiration';
import { Profile } from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Planning />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="inspiration" element={<Inspiration />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
