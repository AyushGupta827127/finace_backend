const BaseModel = require('../baseModel')

class CustomModel extends BaseModel {
  constructor(modelOptions) {
    super(modelOptions)
    console.log("Custom Model called");
  }

  async preCreate(data) {
    // Custom preCreate logic
    console.log("Pre Hook Called")
  }

  async postCreate(result) {
    // Custom postCreate logic
  console.log("Post Hook Called")
  }

}

module.exports = CustomModel
