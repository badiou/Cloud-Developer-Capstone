import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { Categorie } from '../models/Categorie'

export class CategoriesAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly categoriesTable = process.env.CATEGORIES_TABLE,
    private readonly booksTable = process.env.BOOKS_TABLE) {
  }

  async getAllCategories(): Promise<Categorie[]> {
    console.log('Getting all categories')

    const result = await this.docClient.scan({
      TableName: this.categoriesTable
    }).promise()

    const items = result.Items
    return items as Categorie[]
  }

  async createCategorie(categorie: Categorie): Promise<Categorie> {
    await this.docClient.put({
      TableName: this.categoriesTable,
      Item: categorie
    }).promise()

    return categorie
  }
  async updateCategorie(categorieId:string, userId, updatedCategorie){
    await this.docClient.update({
        TableName: this.categoriesTable,
        Key: {
          categorieId,
            userId
        },
        UpdateExpression: 'set #name = :name, #description = :description',
          ExpressionAttributeValues: {
              ':name': updatedCategorie.name,
              ':description': updatedCategorie.description
          },
          ExpressionAttributeNames: {
              '#name': 'name',
              '#description': 'description'
          },
          ReturnValues:"UPDATED_NEW"
      }).promise();
}


  async  categorieExists(categorieId,userId) {
    const result = await this.docClient
      .get({
        TableName: this.categoriesTable,
        Key: {
          categorieId,
          userId
        }
      })
      .promise()
    console.log('Get categorie: ', result)
    return !!result.Item
  }

  async  haveNoBookWithThisCategorie(categorieId,userId) {
    const result = await this.docClient
      .get({
        TableName: this.booksTable,
        Key: {
          categorieId,
          userId
        }
      })
      .promise()
    console.log('Get categorie: ', result)
    return !!result.Item
  }


  // this fucntion allows to delete categorie in database. 
async deleteCategorie(categorieId: string, userId) {
  await this.docClient.delete({
      TableName: this.categoriesTable,
      Key: {
        categorieId,
          userId
      }
  }).promise();
  }

}



function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
