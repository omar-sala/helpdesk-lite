import 'dotenv/config'
import { createApp } from './app.js'

const port = Number(process.env.PORT ?? 4000)
const app = createApp()

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`HelpDesk Lite API listening on ${port}`)
  })
}

export default app
