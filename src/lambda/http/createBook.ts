import {  APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'

import * as middy from 'middy'

import { cors } from 'middy/middlewares'

const docClient = new AWS.DynamoDB.DocumentClient()


const s3= new AWS.S3({
  signatureVersion: 'v4'
})

const categoriesTable = process.env.CATEGORIES_TABLE
const booksTable = process.env.BOOKS_TABLE

const bucketName = process.env.BOOKS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION


export const handler= middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Caller event', event)

  const categorieId = event.pathParameters.categorieId

  if (!await categorieExists(categorieId)) {
    return {
      statusCode: 404,
      // headers: {
      //   'Access-Control-Allow-Origin': '*'
      // }, middy ajoute des header cors. On n'a plus besoin de l'ajouter ici
      body: JSON.stringify({
        error: 'Categorie does not exist'
      })
    }
  }

  const bookId = uuid.v4()
  const newItem = await createBook(categorieId, bookId, event)

  const url= getUploadUrl(bookId)

  return {
    statusCode: 201,
    // headers: {
    //   'Access-Control-Allow-Origin': '*'
    // },middy ajoute des header cors. On n'a plus besoin de l'ajouter ici
    body: JSON.stringify({
      newItem: newItem,
      uploadUrl: url
     
    })
  }
})

async function categorieExists(categorieId: string) {
  const result = await docClient
    .get({
      TableName: categoriesTable,
      Key: {
        id: categorieId
      }
    })
    .promise()

  console.log('Get categorie: ', result)
  return !!result.Item
}

async function createBook(categorieId: string, bookId: string, event: any) {

  const newBook = JSON.parse(event.body)

  const newItem = {
    categorieId,
    bookId,
    ...newBook,
    bookUrl: `https://${bucketName}.s3.amazonaws.com/${bookId}`
  }
  console.log('Storing new item: ', newItem)

  await docClient
    .put({
      TableName: booksTable,
      Item: newItem
    })
    .promise()

  return newItem
}
function getUploadUrl(bookId: string) {
  return s3.getSignedUrl('putObject', { // event: PUT to allow upload/read object
    Bucket: bucketName, // name of S3 bucket
    Key: bookId, // id of object this URL allow access to 
    Expires: +urlExpiration // URL expiration time
  })
}

handler.use(
  cors({
    credentials:true
  })
)
