import * as fs from 'node:fs'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

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

const HomePage = () => {
  return (
    <div className='h-full flex flex-col items-center justify-center gap-4'>
      <p>Hi! Select a test from the sidebar!</p>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: HomePage,
  loader: async () => await getCount(),
})
