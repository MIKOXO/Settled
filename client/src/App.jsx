import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';

const Placeholder = () => (
  <div className="flex items-center justify-center h-[80vh]">
    <h1 className="font-heading text-4xl font-bold text-text-primary">Settled</h1>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Placeholder />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
