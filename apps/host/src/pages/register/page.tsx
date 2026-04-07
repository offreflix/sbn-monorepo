import { useRegisterModel } from "./register.model";
import { RegisterView } from "./register.view";
import type { RegisterProps } from "./register.type";

export function RegisterPage(props: RegisterProps) {
  const model = useRegisterModel(props);
  return <RegisterView {...model} />;
}

export default RegisterPage;
