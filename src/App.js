import './App.scss';
import 'font-awesome/css/font-awesome.min.css'; 
import Authentication from './components/Authentication/Authentication';
import Adminlanding from './components/AdminLanding/AdminLanding';

function App() {
  return (
    <div className="the-link">
      {/* <Authentication /> */}
      <Adminlanding />
    </div>
  );
}

export default App;
