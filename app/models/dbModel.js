const mongoose = require('mongoose')
const fs = require('fs').promises
const path = require('path')

const initModel = (modelName, modelStructure) => {
  // Check if the model already exists
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName] // Return the existing model
  }

  const schemaDefinition = {}
  const schemaFields = modelStructure.schema

  for (const [key, field] of Object.entries(schemaFields)) {
    const fieldOptions = { ...field }
    if (field.type === 'ObjectId') {
      fieldOptions.type = mongoose.Schema.Types.ObjectId
      if (field.ref) {
        fieldOptions.ref = field.ref
      }
    }
    schemaDefinition[key] = fieldOptions
  }

  const schema = new mongoose.Schema(schemaDefinition, { timestamps: true })
  return mongoose.model(modelName, schema) // Register the model
}

// Function to initialize all models during app initialization
const initializeAllModels = async () => {
  try {
    const data = await fs.readFile(path.join(__dirname, './modelsConfig.json'), 'utf-8')
    const modelsConfig = JSON.parse(data)

    for (const modelName in modelsConfig) {
      const modelStructure = modelsConfig[modelName]
      initModel(modelName, modelStructure) // Initialize each model
    }

    console.log('All models initialized successfully')
  } catch (error) {
    console.error('Error initializing models:', error)
  }
}

module.exports = {
  initModel,
  initializeAllModels,
  mongoose,
}
