import type { TransactionsProps } from "./transactions.type";
import { useTransactionsModel } from "./transactions.model";
import { TransactionsView } from "./transactions.view";

export function TransactionList(props: TransactionsProps) {
  const model = useTransactionsModel(props);
  return <TransactionsView {...model} />;
}

export default TransactionList;
