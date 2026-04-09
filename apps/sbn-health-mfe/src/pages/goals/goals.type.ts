import { z } from 'zod'
import { createGoalSchema } from './goals.schema'

export type GoalsProps = {
  selectedDate: string
}

export type CreateGoalForm = z.infer<typeof createGoalSchema>
