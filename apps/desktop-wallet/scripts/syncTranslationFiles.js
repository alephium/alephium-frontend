#!/usr/bin/env node

const glob = require('glob')
const fs = require('fs')

const sourceOfTruthFile = 'locales/en-US/translation.json'

const sync = () => {
  const source = JSON.parse(fs.readFileSync(sourceOfTruthFile, { encoding: 'utf-8' }))
  const allTranslationFiles = glob.sync('locales/**/*.json').filter((path) => path !== sourceOfTruthFile)

  allTranslationFiles.forEach((filepath) => {
    try {
      const data = JSON.parse(fs.readFileSync(filepath, { encoding: 'utf-8' }))
      const newData = {}

      Object.keys(data).forEach((key) => {
        if (source[key]) newData[key] = data[key]
      })

      Object.keys(source).forEach((key) => {
        if (!newData[key]) newData[key] = source[key]
      })

      fs.writeFileSync(filepath, JSON.stringify(newData, null, 2)) // Null and 2 arguments to format the JSON in the file
    } catch (e) {
      console.error('Error occurred while parsing file "' + filepath + '"')
    }
  })
}

sync()
