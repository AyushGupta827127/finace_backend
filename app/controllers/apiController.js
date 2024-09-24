const { modelNames } = require('mongoose')
const {checkValidObjectId} = require('../helpers')
const baseModel = require('./../models/baseModel')
const apiRequest = {}
const api = {
    index: async (req, res) => {
        let segments = req.path.split('/')
        apiRequest.path = req.path
        apiRequest.component = segments[2]  // Get component correctly
        apiRequest.method = req.method

        // Properly merge the request body into input, along with query and params
        apiRequest.input = {
            ...req.query,   // Query parameters
            ...req.params,  // URL parameters
            ...req.body     // Request body data
        }

        // Remove any irrelevant fields in input (like 'component')
        delete apiRequest.input['0']

        // Determine action based on request method
        if (req.method === 'GET' &&  checkValidObjectId(segments[3])) {
            apiRequest.input.id = segments[3]
            apiRequest.action = 'findById'
        } else if (req.method === 'GET') {
            apiRequest.action = 'find'
        } else if (req.method === 'POST') {
            apiRequest.action = 'create'
        } else if (req.method === 'PUT') {
            apiRequest.input.id = segments[3]
            apiRequest.action = 'update'
        } else {
            apiRequest.input.id = segments[3]
            apiRequest.action = 'delete'
        }
        let model
        try {
           const customModelPath = `../models/extentions/${apiRequest.component}`
           const  customModel = require(customModelPath)
           model = new customModel(apiRequest)
           await model.loadModelStructure()
        //    await  model.preCreate()
        //    await model.postCreate()
        } catch (err) {
            model = new baseModel(apiRequest)
            await model.loadModelStructure()
        }

        try {
            let result = await model.callAction()
            res.json({ message: "Success", data: result })
        } catch (err) {
            console.log(err)
            res.status(500).json({
                message: "Something Went Wrong",
                error: err
            })
        }
    }
}

module.exports = { api }
