// 开源项目，未经作者同意，不得以抄袭/复制代码/修改源代码版权信息。
// Copyright @ 2018-present xiejia.he. All rights reserved.
// See https://github.com/xjh22222228/nav

import fs from 'fs'
import path from 'path'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import { writeSEO, writeTemplate, spiderWeb } from './util.mjs'
import { writeDirectory } from './build-directory.mjs'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Shanghai')

const dbPath = path.join('.', 'data', 'db.json')
const setPath = path.join('.', 'data', 'settings.json')

const db = JSON.parse(fs.readFileSync(dbPath).toString())
const settings = JSON.parse(fs.readFileSync(setPath).toString())

const directory = settings.theme === 'Vps' ? writeDirectory() : null
const seoTemplate = writeSEO(directory ? [...directory.db, { name: '商家导航', nav: directory.merchants }] : db, { settings })
const htmlPath = path.join('.', 'src', 'main.html')
const writePath = path.join('.', 'src', 'index.html')
const html = writeTemplate({
  html: fs.readFileSync(htmlPath).toString(),
  settings,
  seoTemplate,
})
fs.writeFileSync(writePath, html)

let errorUrlCount = 0

process.on('exit', () => {
  settings.errorUrlCount = errorUrlCount
  fs.writeFileSync(setPath, JSON.stringify(settings), { encoding: 'utf-8' })
  fs.writeFileSync(dbPath, JSON.stringify(db), { encoding: 'utf-8' })
  console.log('All success!')
})

const { errorUrlCount: count } = await spiderWeb(db, settings)
errorUrlCount = count
