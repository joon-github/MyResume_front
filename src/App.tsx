import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import TemplateWorkspace from './pages/TemplateWorkspace';

const App = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/template/:templateId" element={<TemplateWorkspace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
