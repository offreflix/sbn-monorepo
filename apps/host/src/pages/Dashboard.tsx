import { useNavigate } from 'react-router-dom'
import { Button } from '@repo/ui'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui'
import { Header } from '../components/Header'

export const DashboardPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      <Header subtitle="Dashboard" />

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Financeiro</CardTitle>
            <CardDescription>
              Este shell carregará o microfrontend de finanças (remote) quando
              navegarmos para a rota correspondente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Por enquanto, este é um placeholder. Use o menu para navegar ou
              avance com a integração do remote de finanças.
            </p>
            <Button onClick={() => navigate('/dashboard')}>Recarregar</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
