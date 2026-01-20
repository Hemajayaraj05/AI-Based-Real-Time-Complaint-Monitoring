import { Routes, Route } from "react-router-dom";
import MainLogin from "./pages/MainLogin";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLogin />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
       
      </Route>
    </Routes>
  );
};

export default App;
