import { useLoginModel } from "./login.model";
import { LoginView } from "./login.view";
import type { LoginProps } from "./login.type";

export function LoginPage(props: LoginProps) {
  const model = useLoginModel(props);
  return <LoginView {...model} />;
}

export default LoginPage;
