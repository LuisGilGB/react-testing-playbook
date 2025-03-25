import * as fs from 'node:fs'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import ContainerVisualizer from '../components/ContainerVisualizer'

const filePath = 'count.txt'

const readCount = async () => {
  return parseInt(
    await fs.promises.readFile(filePath, 'utf-8').catch(() => '0'),
  )
}

const getCount = createServerFn({
  method: 'GET',
}).handler(() => {
  return readCount()
})

//const updateCount = createServerFn({ method: 'POST' })
//  .validator((d: number) => d)
//  .handler(async ({ data }) => {
//    const count = await readCount()
//    await fs.promises.writeFile(filePath, `${count + data}`)
//  })

const Home = () => {
  //const router = useRouter()
  //const state = Route.useLoaderData();

  return (
    <ContainerVisualizer />
  )
}

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => await getCount(),
})
