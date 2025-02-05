import { Transaction } from "@/types"

export const TransactionModal = ({ transaction }: { transaction: Transaction }) => {
  return (
    <div>
      <h1>Transaction Details</h1>
      <p>{transaction.version}</p>
      <p>{transaction.lock_time}</p>
      <p>{transaction.input.length}</p>
      <p>{transaction.output.length}</p>
    </div>
  )
}