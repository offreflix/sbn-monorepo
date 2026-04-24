import "./index.css";
import { useAppModel } from "./app.model";
import { AppView } from "./app.view";

const App = () => {
  const model = useAppModel();
  return <AppView {...model} />;
};

export default App;
