import { createFileRoute } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'
import { ContainerVisualizerType } from '../components/ContainerVisualizer'

const ContainerVisualizer = lazy<ContainerVisualizerType>(() =>
  new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      import('../components/ContainerVisualizer').then(({ default: Component }) => resolve({ default: Component }));
    }
  })
)

const TestCasePage = () => {
  return (
    <Suspense fallback={null}>
      <ContainerVisualizer className="min-h-full" />
    </Suspense>
  )
}

export const Route = createFileRoute('/tests/$testCaseId')({
  component: TestCasePage,
})
