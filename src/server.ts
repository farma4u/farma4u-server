import dotenv from 'dotenv'
import 'express-async-errors'

import { app } from './app'
import { hinovaMembersUpdateScheduleService } from './domains/hinova/services'

dotenv.config()

const PORT = 4000

const API_RUNNING = 'API em execução na porta'

hinovaMembersUpdateScheduleService.start()

app.listen(PORT, () => {
  logger.info(`${API_RUNNING} ${PORT}`)
})
