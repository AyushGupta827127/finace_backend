// baseModel.js

const fs = require("fs").promises
const path = require("path")
const { initModel } = require("./dbModel")
const mongoose = require("mongoose")

class baseModel {
  constructor(modelOptions) {
    this.modelOptions = modelOptions
    this.modelName = modelOptions.component
    this.modelStructure = null
    this.input = modelOptions.input
    this.Model = null // Initialize as null, to be set in loadModelStructure
  }

  async loadModelStructure() {
    try {
      const data = await fs.readFile(
        path.join(__dirname, "../models/modelsConfig.json"),
        "utf-8"
      )
      const models = JSON.parse(data)
      this.modelStructure = models[this.modelName]
      if (!this.modelStructure) {
        throw new Error(`Model structure for ${this.modelName} not found`)
      }
      initModel(this.modelName, this.modelStructure)
      this.Model = mongoose.model(this.modelName) // Reinitialize the model after structure is loaded
    } catch (error) {
      throw new Error("Error loading model structure: " + error.message)
    }
  }

  async callAction() {
    if (!this[this.modelOptions.action]) {
      throw new Error(`Action ${this.modelOptions.action} not defined`)
    }
    return await this[this.modelOptions.action]()
  }

  async find() {
    try {
      // If input has conditions, find with those conditions otherwise, find all
      const query = Object.keys(this.input).length > 0 ? this.input : {}
      const result = await this.Model.find(query).exec()
      return result
    } catch (error) {
      console.error("Error finding documents:", error.message) // Log the error message
      throw new Error("Error finding documents: " + error.message)
    }
  }

  async findById() {
    try {
      if (!this.input.id) {
        throw new Error("ID is required for findById action")
      }
  
      const document = await this.Model.findById(this.input.id).exec()
  
      if (!document) {
        return { message: "Data not found", data: null } // Return a message if no document is found
      }
  
      return document
    } catch (error) {
      throw new Error("Error finding document by ID: " + error.message)
    }
  }
  

  async create() {
    try {
      this.validate() // Run validation before creating
      const inputData = this.input // input from apiRequest
      const newDocument = new this.Model(inputData)
      const result = await newDocument.save()
      return result
    } catch (error) {
      throw new Error("Error creating document: " + error.message)
    }
  }

  async update() {
    const id = this.input.id
    const data = this.input
    if (!id) {
      throw new Error(`Document with ID ${id} not found`)
    }

    try {
      this.validate()
      const updatedDocument = await this.Model.findByIdAndUpdate(id, data, {
        new: true,
      }).exec()
      if (!updatedDocument) {
        throw new Error(`Document with ID ${id} not found`)
      }
      return updatedDocument
    } catch (error) {
      throw new Error("Error updating document: " + error.message)
    }
  }

  async delete() {
    const id = this.input.id
    if (!id) {
      throw new Error(`Document with ID ${id} not found`)
    }
    // Assuming you are using Mongoose's findByIdAndDelete
    const result = await this.Model.findByIdAndDelete(id)
    if (!result) {
      throw new Error(`Document with ID ${id} not found`)
    }
    return result
  }

  validate() {
    if (!this.modelStructure || !this.modelStructure.validation) {
      return true // If no validation rules are specified, assume it's valid
    }

    const validationRules = this.modelStructure.validation
    const validationErrors = []

    // Validate each field according to the rules in modelsConfig
    for (const [field, rules] of Object.entries(validationRules)) {
      const value = this.input[field]

      // Validate 'required' fields
      if (this.modelStructure.schema[field].required && !value) {
        validationErrors.push(`${field} is required`)
        continue
      }

      // Validate minLength
      if (rules.minLength && value.length < parseInt(rules.minLength)) {
        validationErrors.push(
          `${field} should have at least ${rules.minLength} characters`
        )
      }

      // Validate maxLength
      if (rules.maxLength && value.length > parseInt(rules.maxLength)) {
        validationErrors.push(
          `${field} should not exceed ${rules.maxLength} characters`
        )
      }

      // Validate regex pattern
      if (rules.regex && !new RegExp(rules.regex).test(value)) {
        validationErrors.push(`${field} is not in the correct format`)
      }
    }

    // If validation errors exist, throw an error
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`)
    }

    return true // Return true if validation passes

  }
}

module.exports = baseModel
